<?php

namespace App\Services;

use App\Models\ContentBlock;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class ContentBlockService
{
    private const PUBLIC_CACHE_KEY = 'content_blocks_public_kv';

    public function getPaginatedBlocks(array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        $sortBy = $filters['sort_by'] ?? 'updated_at';
        $sortOrder = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['name', 'identifier', 'type', 'is_active', 'updated_at'];

        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'updated_at';
        }

        return ContentBlock::query()
            ->when($search, function ($query, $search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('identifier', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            })
            ->orderBy($sortBy, $sortOrder)
            ->paginate(10);
    }

    public function getById(int $id): ContentBlock
    {
        return ContentBlock::findOrFail($id);
    }

    public function create(array $data): ContentBlock
    {
        $block = ContentBlock::create([
            ...$data,
            'content' => $this->normalizeContent($data['type'], $data['content'] ?? null),
            'is_active' => $data['is_active'] ?? true,
        ]);

        $this->flushPublicCache();

        return $block;
    }

    public function update(int $id, array $data): ContentBlock
    {
        $block = $this->getById($id);

        if (array_key_exists('type', $data) || array_key_exists('content', $data)) {
            $type = $data['type'] ?? $block->type;
            $data['content'] = $this->normalizeContent($type, $data['content'] ?? $block->content);
        }

        $block->update($data);
        $this->flushPublicCache();

        return $block->fresh();
    }

    public function delete(int $id): void
    {
        $block = $this->getById($id);
        $block->delete();
        $this->flushPublicCache();
    }

    public function getActiveBlockByIdentifier(string $identifier): ?array
    {
        $blocks = Cache::rememberForever(self::PUBLIC_CACHE_KEY, function (): array {
            return ContentBlock::query()
                ->where('is_active', true)
                ->get(['identifier', 'type', 'content'])
                ->mapWithKeys(fn (ContentBlock $block): array => [
                    $block->identifier => [
                        'identifier' => $block->identifier,
                        'type' => $block->type,
                        'content' => $this->castContent($block->type, $block->content),
                    ],
                ])
                ->all();
        });

        return $blocks[$identifier] ?? null;
    }

    private function normalizeContent(string $type, mixed $content): ?string
    {
        if ($content === null || $content === '') {
            return null;
        }

        return match ($type) {
            'json' => is_string($content) ? $content : (json_encode($content) ?: null),
            default => is_string($content) ? $content : (string) $content,
        };
    }

    private function castContent(string $type, ?string $content): mixed
    {
        if ($content === null) {
            return null;
        }

        if ($type === 'json') {
            $decoded = json_decode($content, true);
            return json_last_error() === JSON_ERROR_NONE ? $decoded : $content;
        }

        return $content;
    }

    private function flushPublicCache(): void
    {
        Cache::forget(self::PUBLIC_CACHE_KEY);
    }
}


<?php

namespace App\Services;

use App\Models\StoreHighlight;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class StoreHighlightService
{
    public const MAX_ACTIVE = 4;

    public function getPaginatedHighlights(array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        $sortBy = $filters['sort_by'] ?? 'sort_order';
        $sortOrder = ($filters['sort_dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['title', 'sort_order', 'is_active', 'updated_at'];

        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        return StoreHighlight::query()
            ->when($search, function ($query, $search): void {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy($sortBy, $sortOrder)
            ->orderByDesc('id')
            ->paginate(10);
    }

    public function getById(int $id): StoreHighlight
    {
        return StoreHighlight::findOrFail($id);
    }

    public function create(array $data): StoreHighlight
    {
        $payload = [
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ];

        $this->ensureActiveLimit((bool) $payload['is_active']);

        return StoreHighlight::create($payload);
    }

    public function update(int $id, array $data): StoreHighlight
    {
        $highlight = $this->getById($id);
        $shouldBeActive = array_key_exists('is_active', $data)
            ? (bool) $data['is_active']
            : $highlight->is_active;

        $this->ensureActiveLimit($shouldBeActive, $highlight->id);

        $highlight->update($data);

        return $highlight->fresh();
    }

    public function delete(int $id): void
    {
        $highlight = $this->getById($id);
        $highlight->delete();
    }

    public function getActiveForStorefront(int $limit = self::MAX_ACTIVE): Collection
    {
        $limit = max(1, min(self::MAX_ACTIVE, $limit));

        return StoreHighlight::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }

    public function getActiveCount(): int
    {
        return StoreHighlight::query()
            ->where('is_active', true)
            ->count();
    }

    private function ensureActiveLimit(bool $isActive, ?int $ignoreId = null): void
    {
        if (! $isActive) {
            return;
        }

        $activeCount = StoreHighlight::query()
            ->where('is_active', true)
            ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
            ->count();

        if ($activeCount >= self::MAX_ACTIVE) {
            throw ValidationException::withMessages([
                'is_active' => sprintf('You can have at most %d active store highlights.', self::MAX_ACTIVE),
            ]);
        }
    }
}

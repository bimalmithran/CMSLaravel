<?php

namespace App\Services;

use App\Models\Tag;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class TagService
{
    public function getPaginatedTags(array $filters): LengthAwarePaginator
    {
        $query = Tag::query();

        if (! empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (! empty($filters['sort_by']) && ! empty($filters['sort_dir'])) {
            $query->orderBy($filters['sort_by'], $filters['sort_dir']);
        } else {
            $query->orderBy('name');
        }

        return $query->paginate(10);
    }

    public function getAllTagsList(): Collection
    {
        return Tag::query()
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    public function createTag(array $data): Tag
    {
        return Tag::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function getTagById(int $id): Tag
    {
        return Tag::findOrFail($id);
    }

    public function updateTag(int $id, array $data): Tag
    {
        $tag = $this->getTagById($id);

        $tag->update([
            'name' => $data['name'] ?? $tag->name,
            'slug' => isset($data['name']) ? Str::slug($data['name']) : $tag->slug,
            'is_active' => $data['is_active'] ?? $tag->is_active,
        ]);

        return $tag;
    }

    public function deleteTag(int $id): void
    {
        $this->getTagById($id)->delete();
    }
}

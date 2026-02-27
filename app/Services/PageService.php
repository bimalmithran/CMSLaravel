<?php

namespace App\Services;

use App\Models\Page;
use Illuminate\Pagination\LengthAwarePaginator;

class PageService
{
    public function getPaginatedPages(array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        $sortBy = $filters['sort_by'] ?? 'updated_at';
        $sortOrder = $filters['sort_dir'] ?? 'desc';
        $allowedSorts = ['title', 'slug', 'is_active', 'updated_at', 'created_at'];

        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'updated_at';
        }
        $sortOrder = $sortOrder === 'asc' ? 'asc' : 'desc';

        return Page::query()
            ->when($search, function ($query, $search): void {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('meta_title', 'like', "%{$search}%");
            })
            ->orderBy($sortBy, $sortOrder)
            ->paginate(10);
    }

    public function getPageById(int $id): Page
    {
        return Page::findOrFail($id);
    }

    public function createPage(array $data): Page
    {
        $data['slug'] = $data['slug'] ?? Page::generateSlug($data['title']);

        return Page::create($data);
    }

    public function updatePage(int $id, array $data): Page
    {
        $page = $this->getPageById($id);

        if (array_key_exists('title', $data) && (! array_key_exists('slug', $data) || $data['slug'] === null)) {
            $data['slug'] = Page::generateSlug($data['title']);
        }

        $page->update($data);

        return $page->fresh();
    }

    public function deletePage(int $id): void
    {
        $page = $this->getPageById($id);
        $page->delete();
    }

    public function getActivePageBySlug(string $slug): Page
    {
        return Page::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }
}


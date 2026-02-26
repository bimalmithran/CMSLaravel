<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class CategoryService
{
    public function getPaginatedCategories(array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        $sortBy = $filters['sort_by'] ?? 'id';
        $sortOrder = $filters['sort_dir'] ?? 'desc';

        return Category::with('parent:id,name')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('parent', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy($sortBy, $sortOrder)
            ->paginate(20);
    }

    public function getAllCategoriesList(): Collection
    {
        return Category::orderBy('order')->orderBy('name')->get();
    }

    public function createCategory(array $data): Category
    {
        $data['slug'] = $data['slug'] ?? Category::generateSlug($data['name']);

        return Category::create($data);
    }

    public function getCategoryById(int $id): Category
    {
        return Category::findOrFail($id);
    }

    public function updateCategory(int $id, array $data): Category
    {
        $category = $this->getCategoryById($id);

        if (array_key_exists('name', $data) && (!array_key_exists('slug', $data) || $data['slug'] === null)) {
            $data['slug'] = Category::generateSlug($data['name']);
        }

        $category->update($data);

        return $category->fresh();
    }

    public function deleteCategory(int $id): void
    {
        $category = $this->getCategoryById($id);

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();
    }
}

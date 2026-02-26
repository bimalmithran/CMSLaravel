<?php

namespace App\Services;

use App\Models\Menu;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class MenuService
{
    public function getPaginatedMenus(array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        $sortBy = $filters['sort_by'] ?? 'id';
        $sortOrder = $filters['sort_dir'] ?? 'desc';

        return Menu::with('parent')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('parent', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy($sortBy, $sortOrder)
            ->paginate(10);
    }

    public function getAllMenusList(): Collection
    {
        return Menu::with('parent')->orderBy('position')->get();
    }

    public function createMenu(array $data): Menu
    {
        $data['slug'] = $data['slug'] ?? Menu::generateSlug($data['name']);

        return Menu::create($data);
    }

    public function getMenuById(int $id): Menu
    {
        return Menu::with('children')->findOrFail($id);
    }

    public function updateMenu(int $id, array $data): Menu
    {
        $menu = Menu::findOrFail($id);

        if (array_key_exists('name', $data) && (!array_key_exists('slug', $data) || $data['slug'] === null)) {
            $data['slug'] = Menu::generateSlug($data['name']);
        }

        $menu->update($data);

        return $menu->fresh();
    }

    public function deleteMenu(int $id): void
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();
    }
}

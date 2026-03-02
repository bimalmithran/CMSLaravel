<?php

namespace App\Services;

use App\Models\Category;
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
        $allowedSorts = ['id', 'name', 'menu_type', 'position', 'is_active', 'created_at', 'updated_at'];

        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'id';
        }
        $sortOrder = $sortOrder === 'asc' ? 'asc' : 'desc';

        return Menu::with(['parent', 'page'])
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('menu_type', 'like', "%{$search}%")
                    ->orWhereHas('parent', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('page', function ($q) use ($search) {
                        $q->where('title', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%");
                    });
            })
            ->orderBy($sortBy, $sortOrder)
            ->paginate(10);
    }

    public function getAllMenusList(): Collection
    {
        return Menu::with(['parent', 'page'])->orderBy('position')->get();
    }

    public function createMenu(array $data): Menu
    {
        $data['slug'] = $data['slug'] ?? Menu::generateSlug($data['name']);

        return Menu::create($data);
    }

    public function getMenuById(int $id): Menu
    {
        return Menu::with(['children', 'parent', 'page'])->findOrFail($id);
    }

    public function updateMenu(int $id, array $data): Menu
    {
        $menu = Menu::findOrFail($id);

        if (array_key_exists('name', $data) && (!array_key_exists('slug', $data) || $data['slug'] === null)) {
            $data['slug'] = Menu::generateSlug($data['name']);
        }

        $menu->update($data);

        return $menu->fresh(['parent', 'page']);
    }

    public function deleteMenu(int $id): void
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();
    }

    public function getActiveMenuTreeForStorefront(): Collection
    {
        $menus = Menu::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with([
                'page:id,title,slug,is_active',
                'childrenRecursive' => fn($query) => $query
                    ->where('is_active', true)
                    ->orderBy('position'),
            ])
            ->orderBy('position')
            ->get();

        $categories = Category::query()
            ->active()
            ->orderBy('order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'parent_id']);

        return $menus->map(fn(Menu $menu) => $this->transformStorefrontMenu($menu, $categories));
    }

    private function transformStorefrontMenu(Menu $menu, Collection $categories): array
    {
        return [
            'id' => $menu->id,
            'name' => $menu->name,
            'slug' => $menu->slug,
            'description' => $menu->description,
            'menu_type' => $menu->menu_type,
            'position' => $menu->position,
            'is_active' => $menu->is_active,
            'url' => $this->resolveMenuUrl($menu),
            'page' => $menu->page ? [
                'id' => $menu->page->id,
                'title' => $menu->page->title,
                'slug' => $menu->page->slug,
            ] : null,
            'children' => $menu->childrenRecursive
                ->where('is_active', true)
                ->sortBy('position')
                ->values()
                ->map(fn(Menu $child) => $this->transformStorefrontMenu($child, $categories))
                ->all(),
            'product_categories' => $menu->menu_type === Menu::TYPE_PRODUCT_LISTING
                ? $categories->values()->all()
                : [],
        ];
    }

    private function resolveMenuUrl(Menu $menu): ?string
    {
        if ($menu->menu_type !== Menu::TYPE_LINK || ! $menu->page || ! $menu->page->is_active) {
            return null;
        }

        return '/' . $menu->page->slug . '.php';
    }
}

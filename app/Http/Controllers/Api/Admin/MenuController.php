<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_dir', 'desc');
        // Logic to list all menus in a paginated manner
        $menus = Menu::with('parent')->when($search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
            $query->orWhere('description', 'like', "%{$search}%");
            $query->orWhereHas('parent', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        })->orderBy($sortBy, $sortOrder)->paginate(10);

        return response()->json(['success' => true, 'data' => $menus]);
    }

    public function list(Request $request): JsonResponse
    {
        // Logic to list all menus without pagination
        $menus = Menu::with('parent')->orderBy('position')->get();

        return response()->json(['success' => true, 'data' => $menus]);
    }

    public function store(Request $request): JsonResponse
    {
        // Logic to create a new menu
        $validated = $request->validate([
            'name' => 'required|string|unique:menus,name',
            'slug' => ['nullable', 'string', 'max:255', 'unique:menus,slug'],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'position' => 'integer',
            'parent_id' => 'nullable|exists:menus,id',
        ]);

        $slug = $validated['slug'] ?? Menu::generateSlug($validated['name']);
        $validated['slug'] = $slug;

        $menu = Menu::create($validated);
        return response()->json(['success' => true, 'data' => $menu], 201);
    }

    public function show($id)
    {
        // Logic to show a specific menu
        $menu = Menu::with('children')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $menu]);
    }

    public function update(Request $request, $id)
    {
        // Logic to update a specific menu
        $menu = Menu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|unique:menus,name,' . $menu->id,
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('menus', 'slug')->ignore($menu->id)],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'position' => 'integer',
            'parent_id' => 'nullable|exists:menus,id',
        ]);

        if (array_key_exists('name', $validated) && (!array_key_exists('slug', $validated) || $validated['slug'] === null)) {
            $validated['slug'] = Menu::generateSlug($validated['name']);
        }

        $menu->update($validated);
        return response()->json(['success' => true, 'data' => $menu->fresh()]);
    }

    public function destroy($id)
    {
        // Logic to delete a specific menu
        $menu = Menu::findOrFail($id);
        $menu->delete();
        return response()->json(['success' => true]);
    }
}

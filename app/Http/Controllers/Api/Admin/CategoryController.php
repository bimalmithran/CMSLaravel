<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::with('parent:id,name')->orderBy('order')->orderBy('name')->paginate(20);

        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function list(Request $request): JsonResponse
    {
        $categories = Category::orderBy('order')->orderBy('name')->get();

        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
            'image_file' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $slug = $validated['slug'] ?? Category::generateSlug($validated['name']);

        $category = new Category([
            ...$validated,
            'slug' => $slug,
        ]);

        if ($request->hasFile('image_file')) {
            $category->image = $request->file('image_file')->store('categories', 'public');
        }

        $category->save();

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($category->id)],
            'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category->id)],
            'description' => ['sometimes', 'nullable', 'string'],
            'order' => ['sometimes', 'nullable', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
            'image_file' => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
        ]);

        if (array_key_exists('name', $validated) && (!array_key_exists('slug', $validated) || $validated['slug'] === null)) {
            $validated['slug'] = Category::generateSlug($validated['name']);
        }

        if ($request->hasFile('image_file')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $validated['image'] = $request->file('image_file')->store('categories', 'public');
        }

        $category->update($validated);

        return response()->json(['success' => true, 'data' => $category->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return response()->json(['success' => true]);
    }
}


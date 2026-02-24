<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query->orderByDesc('id')->paginate(20);

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255', 'unique:products,name'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'long_description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'discount_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'sku' => ['required', 'string', 'max:255', 'unique:products,sku'],
            'attributes' => ['nullable'],
            'weight' => ['nullable', 'string', 'max:255'],
            'material' => ['nullable', 'string', 'max:255'],
            'purity' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'image_file' => ['nullable', 'file', 'image', 'max:5120'],
            'gallery_files' => ['nullable', 'array'],
            'gallery_files.*' => ['file', 'image', 'max:5120'],
        ]);

        $validated['slug'] = $validated['slug'] ?? Product::generateSlug($validated['name']);
        $validated['stock'] = $validated['stock'] ?? 0;

        if (isset($validated['attributes']) && is_string($validated['attributes'])) {
            $decoded = json_decode($validated['attributes'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $validated['attributes'] = $decoded;
            }
        }

        $product = new Product($validated);

        if ($request->hasFile('image_file')) {
            $product->image = $request->file('image_file')->store('products', 'public');
        }

        if ($request->hasFile('gallery_files')) {
            $gallery = [];
            foreach ($request->file('gallery_files') as $file) {
                $gallery[] = $file->store('products/gallery', 'public');
            }
            $product->gallery = $gallery;
        }

        $product->save();

        return response()->json(['success' => true, 'data' => $product->fresh()], 201);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('category')->findOrFail($id);

        return response()->json(['success' => true, 'data' => $product]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('products', 'name')->ignore($product->id)],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product->id)],
            'description' => ['sometimes', 'nullable', 'string'],
            'long_description' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'discount_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'sku' => ['sometimes', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($product->id)],
            'attributes' => ['sometimes', 'nullable'],
            'weight' => ['sometimes', 'nullable', 'string', 'max:255'],
            'material' => ['sometimes', 'nullable', 'string', 'max:255'],
            'purity' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'image_file' => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
            'gallery_files' => ['sometimes', 'nullable', 'array'],
            'gallery_files.*' => ['file', 'image', 'max:5120'],
            'clear_gallery' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('name', $validated) && (!array_key_exists('slug', $validated) || $validated['slug'] === null)) {
            $validated['slug'] = Product::generateSlug($validated['name']);
        }

        if (isset($validated['attributes']) && is_string($validated['attributes'])) {
            $decoded = json_decode($validated['attributes'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $validated['attributes'] = $decoded;
            }
        }

        if ($request->hasFile('image_file')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image_file')->store('products', 'public');
        }

        if (($validated['clear_gallery'] ?? false) === true) {
            foreach (($product->gallery ?? []) as $path) {
                Storage::disk('public')->delete($path);
            }
            $validated['gallery'] = [];
        }

        if ($request->hasFile('gallery_files')) {
            $gallery = $product->gallery ?? [];
            foreach ($request->file('gallery_files') as $file) {
                $gallery[] = $file->store('products/gallery', 'public');
            }
            $validated['gallery'] = $gallery;
        }

        unset($validated['image_file'], $validated['gallery_files'], $validated['clear_gallery']);

        $product->update($validated);

        return response()->json(['success' => true, 'data' => $product->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        foreach (($product->gallery ?? []) as $path) {
            Storage::disk('public')->delete($path);
        }

        $product->delete();

        return response()->json(['success' => true]);
    }
}


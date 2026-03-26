<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::query()->active();

        $tagSlug = trim($request->string('tag')->toString());
        $onlyWithProducts = $request->boolean('has_products');

        if ($onlyWithProducts) {
            $query->whereHas('products', function ($productQuery): void {
                $productQuery->active();
            });
        }

        if ($tagSlug !== '') {
            $query->whereHas('products', function ($productQuery) use ($tagSlug): void {
                $productQuery
                    ->active()
                    ->whereHas('tags', function ($tagQuery) use ($tagSlug): void {
                        $tagQuery
                            ->where('is_active', true)
                            ->where('slug', $tagSlug);
                    });
            });
        }

        $categories = $query
            ->orderBy('order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $category = Category::with(['products' => fn ($q) => $q->active()])
            ->active()
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }
}

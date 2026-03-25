<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->active()->with('tags');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $tagSlugs = $this->extractTagSlugs($request);
        if ($tagSlugs !== []) {
            $query->whereHas('tags', function ($tagQuery) use ($tagSlugs): void {
                $tagQuery
                    ->where('is_active', true)
                    ->whereIn('slug', $tagSlugs);
            });
        }

        if ($request->filled('min_price') && $request->filled('max_price')) {
            $query->whereBetween('price', [
                (float) $request->input('min_price'),
                (float) $request->input('max_price'),
            ]);
        }

        if ($request->filled('material')) {
            $query->where('material', $request->string('material')->toString());
        }

        if ($request->filled('purity')) {
            $query->where('purity', $request->string('purity')->toString());
        }

        $sortBy = $request->string('sort_by', 'created_at')->toString();
        $sortOrder = $request->string('sort_order', 'desc')->toString() === 'asc' ? 'asc' : 'desc';

        $sortMap = [
            'created_at' => 'created_at',
            'price' => 'price',
            'views' => 'views',
            'rating' => 'rating_avg',
            'name' => 'name',
        ];

        if (! array_key_exists($sortBy, $sortMap)) {
            $sortBy = 'created_at';
        }

        $query->orderBy($sortMap[$sortBy], $sortOrder);

        $perPage = (int) $request->input('per_page', 15);
        $perPage = max(1, min(100, $perPage));

        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with([
                'reviews' => fn ($q) => $q->where('is_approved', true),
                'tags',
            ])
            ->active()
            ->findOrFail($id);

        $product->increment('views');

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    public function featured(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 10);
        $limit = max(1, min(50, $limit));

        $products = Product::featured()->active()->limit($limit)->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function related(int $id, Request $request): JsonResponse
    {
        $product = Product::active()->findOrFail($id);

        $limit = (int) $request->input('limit', 5);
        $limit = max(1, min(50, $limit));

        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->active()
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $relatedProducts,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $q = $request->string('q', '')->toString();

        if ($q === '') {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $products = Product::active()
            ->with('tags')
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%");
            })
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function extractTagSlugs(Request $request): array
    {
        $rawTags = $request->input('tags');

        if (is_string($rawTags) && trim($rawTags) !== '') {
            return array_values(array_filter(array_map('trim', explode(',', $rawTags))));
        }

        if (is_array($rawTags)) {
            return array_values(array_filter(array_map(
                static fn ($tag): string => trim((string) $tag),
                $rawTags,
            )));
        }

        $singleTag = trim($request->string('tag')->toString());

        return $singleTag !== '' ? [$singleTag] : [];
    }
}

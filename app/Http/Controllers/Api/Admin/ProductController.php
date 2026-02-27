<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductType;
use App\Services\ProductSpecs\SpecFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'productType']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%");
        }

        if ($request->has('sort_by') && $request->has('sort_dir')) {
            $query->orderBy($request->sort_by, $request->sort_dir);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(10)
        ]);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'brand', 'productType', 'sizes'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $this->formatProductWithSpecs($product)]);
    }

    public function store(Request $request)
    {
        $baseData = $this->validateBaseProduct($request);
        $baseData['slug'] = Str::slug($baseData['name']);

        $productType = ProductType::findOrFail($request->product_type_id);
        $strategy = SpecFactory::make($productType->slug);

        $rawSpecs = $request->input('specs', []);
        $validatedSpecs = $strategy->validate($rawSpecs);

        DB::beginTransaction();

        try {
            $product = Product::create($baseData);
            $strategy->store($product, $validatedSpecs);
            $this->syncSizes($product, $request->input('sizes', []));

            DB::commit();

            // Reload base relations and format dynamically
            $product->load(['category', 'brand', 'productType', 'sizes']);
            return response()->json([
                'success' => true,
                'data' => $this->formatProductWithSpecs($product)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $baseData = $this->validateBaseProduct($request, $product->id);
        $baseData['slug'] = Str::slug($baseData['name']);

        $productType = ProductType::findOrFail($product->product_type_id);
        $strategy = SpecFactory::make($productType->slug);

        $rawSpecs = $request->input('specs', []);
        $validatedSpecs = $strategy->validate($rawSpecs, $product);

        DB::beginTransaction();

        try {
            $product->update($baseData);
            $strategy->update($product, $validatedSpecs);
            $this->syncSizes($product, $request->input('sizes', []));

            DB::commit();

            // Reload base relations and format dynamically
            $product->load(['category', 'brand', 'productType', 'sizes']);
            return response()->json([
                'success' => true,
                'data' => $this->formatProductWithSpecs($product)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Product deleted successfully']);
    }

    // --- Private Helpers ---

    /**
     * OCP FIX: Dynamically load the specific spec relation based on type slug,
     * and map it to a unified 'specs' array for the frontend.
     */
    private function formatProductWithSpecs(Product $product): array
    {
        // Example: 'diamond' -> 'diamondSpec'
        $specRelation = Str::camel($product->productType->slug . '_spec');

        if (method_exists($product, $specRelation)) {
            $product->load($specRelation);
        }

        $productArray = $product->toArray();
        $productArray['specs'] = $product->$specRelation ?? [];

        return $productArray;
    }

    private function validateBaseProduct(Request $request, ?int $ignoreId = null): array
    {
        $nameRule = 'required|string|max:255|unique:products,name';
        $skuRule = 'required|string|max:100|unique:products,sku';

        if ($ignoreId) {
            $nameRule .= ',' . $ignoreId;
            $skuRule .= ',' . $ignoreId;
        }

        return $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'product_type_id' => $ignoreId ? 'prohibited' : 'required|exists:product_types,id',
            'name' => $nameRule,
            'sku' => $skuRule,
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);
    }

    private function syncSizes(Product $product, array $sizes): void
    {
        if (empty($sizes)) {
            $product->sizes()->detach();
            return;
        }

        $syncData = [];
        foreach ($sizes as $size) {
            if (isset($size['size_id'])) {
                $syncData[$size['size_id']] = [
                    'stock' => $size['stock'] ?? 0,
                    'weight_adjustment' => $size['weight_adjustment'] ?? 0,
                    'price_adjustment' => $size['price_adjustment'] ?? 0,
                ];
            }
        }
        $product->sizes()->sync($syncData);
    }
}

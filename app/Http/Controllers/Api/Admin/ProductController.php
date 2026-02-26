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
        $product = Product::with([
            'category',
            'brand',
            'productType',
            'jewelrySpec',
            'watchSpec',
            'diamondSpec',
            'sizes'
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $product]);
    }

    public function store(Request $request)
    {
        // 1. Validate Base Fields
        $baseData = $this->validateBaseProduct($request);
        $baseData['slug'] = Str::slug($baseData['name']);

        // 2. Resolve the Strategy based on Product Type
        $productType = ProductType::findOrFail($request->product_type_id);
        $strategy = SpecFactory::make($productType->slug);

        // 3. Validate Specs BEFORE starting the transaction
        // (If validation fails, Laravel automatically returns a 422 JSON response)
        $rawSpecs = $request->input('specs', []);
        $validatedSpecs = $strategy->validate($rawSpecs);

        DB::beginTransaction();

        try {
            // Save Base
            $product = Product::create($baseData);

            // Save Specs via Strategy
            $strategy->store($product, $validatedSpecs);

            // Sync Sizes
            $this->syncSizes($product, $request->input('sizes', []));

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $product->load(['jewelrySpec', 'watchSpec', 'diamondSpec', 'sizes'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // 1. Validate Base Fields
        $baseData = $this->validateBaseProduct($request, $product->id);
        $baseData['slug'] = Str::slug($baseData['name']);

        // 2. Resolve Strategy (Product Type cannot be changed safely, we rely on the existing one)
        $productType = ProductType::findOrFail($product->product_type_id);
        $strategy = SpecFactory::make($productType->slug);

        // 3. Validate Specs
        $rawSpecs = $request->input('specs', []);
        $validatedSpecs = $strategy->validate($rawSpecs, $product);

        DB::beginTransaction();

        try {
            $product->update($baseData);

            // Update Specs via Strategy
            $strategy->update($product, $validatedSpecs);

            // Sync Sizes
            $this->syncSizes($product, $request->input('sizes', []));

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $product->fresh(['jewelrySpec', 'watchSpec', 'diamondSpec', 'sizes'])
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

    /**
     * Extracted to keep the controller clean (SRP)
     */
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
            'product_type_id' => $ignoreId ? 'prohibited' : 'required|exists:product_types,id', // Cannot update type later
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

    /**
     * Extracted to keep the controller clean (SRP)
     */
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

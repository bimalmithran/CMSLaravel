<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Eager load the basic relations needed for the data table
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
        // Load EVERYTHING so the frontend edit form has all the data it needs
        $product = Product::with([
            'category',
            'brand',
            'productType',
            'jewelrySpec',
            'watchSpec',
            'diamondSpec',
            'sizes'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validate Base Product Fields
        $baseData = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'product_type_id' => 'required|exists:product_types,id',
            'name' => 'required|string|max:255|unique:products,name',
            'sku' => 'required|string|max:100|unique:products,sku',
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

        $baseData['slug'] = Str::slug($baseData['name']);

        // Fetch the type to know which spec table we are dealing with
        $productType = ProductType::findOrFail($request->product_type_id);

        // START TRANSACTION: If specs fail, the base product won't be saved orphaned.
        DB::beginTransaction();

        try {
            // 2. Create the Base Product
            $product = Product::create($baseData);

            // 3. Route to the correct Subtype table based on the Product Type Slug
            switch ($productType->slug) {
                case 'jewelry':
                    $specData = $request->validate([
                        'specs.huid' => 'nullable|string|max:6|unique:jewelry_specs,huid',
                        'specs.metal_type' => 'nullable|string',
                        'specs.metal_color' => 'nullable|string',
                        'specs.purity' => 'nullable|string',
                        'specs.gender' => 'nullable|string',
                        'specs.gross_weight' => 'nullable|numeric',
                        'specs.net_weight' => 'nullable|numeric',
                        'specs.making_charge' => 'nullable|numeric',
                        'specs.making_charge_type' => 'nullable|in:flat,percent',
                    ]);
                    if (!empty($specData['specs'])) {
                        $product->jewelrySpec()->create($specData['specs']);
                    }
                    break;

                case 'watch':
                    $specData = $request->validate([
                        'specs.movement_type' => 'nullable|string',
                        'specs.dial_color' => 'nullable|string',
                        'specs.strap_material' => 'nullable|string',
                        'specs.glass_material' => 'nullable|string',
                        'specs.water_resistance' => 'nullable|string',
                        'specs.case_size' => 'nullable|string',
                        'specs.warranty_period' => 'nullable|string',
                    ]);
                    if (!empty($specData['specs'])) {
                        $product->watchSpec()->create($specData['specs']);
                    }
                    break;

                case 'diamond':
                    $specData = $request->validate([
                        'specs.diamond_clarity' => 'nullable|string',
                        'specs.diamond_color' => 'nullable|string',
                        'specs.diamond_cut' => 'nullable|string',
                        'specs.diamond_setting' => 'nullable|string',
                        'specs.diamond_count' => 'nullable|integer',
                    ]);
                    if (!empty($specData['specs'])) {
                        $product->diamondSpec()->create($specData['specs']);
                    }
                    break;
            }

            // 4. Handle Sizes / Variations
            // Expecting an array like: [{ size_id: 1, stock: 5, price_adjustment: 0 }]
            if ($request->has('sizes') && is_array($request->sizes)) {
                $syncData = [];
                foreach ($request->sizes as $size) {
                    $syncData[$size['size_id']] = [
                        'stock' => $size['stock'] ?? 0,
                        'weight_adjustment' => $size['weight_adjustment'] ?? 0,
                        'price_adjustment' => $size['price_adjustment'] ?? 0,
                    ];
                }
                $product->sizes()->sync($syncData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $product->load(['jewelrySpec', 'watchSpec', 'sizes'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e; // Laravel will catch this and return a 500 error
        }
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $productType = ProductType::findOrFail($request->product_type_id ?? $product->product_type_id);

        $baseData = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'name' => 'required|string|max:255|unique:products,name,' . $product->id,
            'sku' => 'required|string|max:100|unique:products,sku,' . $product->id,
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

        $baseData['slug'] = Str::slug($baseData['name']);

        DB::beginTransaction();

        try {
            $product->update($baseData);

            // Update the correct Subtype
            switch ($productType->slug) {
                case 'jewelry':
                    $specData = $request->validate([
                        'specs.huid' => 'nullable|string|max:6|unique:jewelry_specs,huid,' . optional($product->jewelrySpec)->id,
                        'specs.metal_type' => 'nullable|string',
                        // ... (keep the rest of your jewelry validation rules)
                        'specs.making_charge_type' => 'nullable|in:flat,percent',
                    ]);
                    if (!empty($specData['specs'])) {
                        $product->jewelrySpec()->updateOrCreate(['product_id' => $product->id], $specData['specs']);
                    }
                    break;

                case 'watch':
                    $specData = $request->validate([
                        'specs.movement_type' => 'nullable|string',
                        // ... (keep the rest of your watch validation rules)
                        'specs.warranty_period' => 'nullable|string',
                    ]);
                    if (!empty($specData['specs'])) {
                        $product->watchSpec()->updateOrCreate(['product_id' => $product->id], $specData['specs']);
                    }
                    break;

                case 'diamond':
                    $specData = $request->validate([
                        'specs.diamond_clarity' => 'nullable|string',
                        'specs.diamond_color' => 'nullable|string',
                        'specs.diamond_cut' => 'nullable|string',
                        'specs.diamond_setting' => 'nullable|string',
                        'specs.diamond_count' => 'nullable|integer',
                    ]);
                    if (!empty($specData['specs'])) {
                        $product->diamondSpec()->updateOrCreate(['product_id' => $product->id], $specData['specs']);
                    }
                    break;
            }

            // Sync Sizes
            if ($request->has('sizes') && is_array($request->sizes)) {
                $syncData = [];
                foreach ($request->sizes as $size) {
                    $syncData[$size['size_id']] = [
                        'stock' => $size['stock'] ?? 0,
                        'weight_adjustment' => $size['weight_adjustment'] ?? 0,
                        'price_adjustment' => $size['price_adjustment'] ?? 0,
                    ];
                }
                $product->sizes()->sync($syncData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $product->fresh(['jewelrySpec', 'watchSpec', 'sizes'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function destroy($id)
    {
        // Because we used ON DELETE CASCADE in our migrations,
        // deleting the base product will automatically delete the linked 
        // jewelry_specs, watch_specs, and product_size pivot records!
        Product::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Product deleted successfully']);
    }
}

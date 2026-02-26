<?php

namespace App\Services\ProductSpecs;

use App\Models\Product;
use Illuminate\Support\Facades\Validator;

class JewelryStrategy implements SpecStrategyInterface
{
    public function validate(array $data, ?Product $product = null): array
    {
        // Handle the unique rule dynamically for updates
        $huidRule = 'nullable|string|max:6|unique:jewelry_specs,huid';
        if ($product && $product->jewelrySpec) {
            $huidRule .= ',' . $product->jewelrySpec->id;
        }

        return Validator::make($data, [
            'huid' => $huidRule,
            'metal_type' => 'nullable|string',
            'metal_color' => 'nullable|string',
            'purity' => 'nullable|string',
            'gender' => 'nullable|string',
            'gross_weight' => 'nullable|numeric',
            'net_weight' => 'nullable|numeric',
            'making_charge' => 'nullable|numeric',
            'making_charge_type' => 'nullable|in:flat,percent',
        ])->validate();
    }

    public function store(Product $product, array $validatedData): void
    {
        if (!empty($validatedData)) {
            $product->jewelrySpec()->create($validatedData);
        }
    }

    public function update(Product $product, array $validatedData): void
    {
        if (!empty($validatedData)) {
            $product->jewelrySpec()->updateOrCreate(['product_id' => $product->id], $validatedData);
        }
    }
}

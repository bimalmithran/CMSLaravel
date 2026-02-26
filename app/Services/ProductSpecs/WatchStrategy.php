<?php

namespace App\Services\ProductSpecs;

use App\Models\Product;
use Illuminate\Support\Facades\Validator;

class WatchStrategy implements SpecStrategyInterface
{
    public function validate(array $data, ?Product $product = null): array
    {
        return Validator::make($data, [
            'movement_type' => 'nullable|string',
            'dial_color' => 'nullable|string',
            'strap_material' => 'nullable|string',
            'glass_material' => 'nullable|string',
            'water_resistance' => 'nullable|string',
            'case_size' => 'nullable|string',
            'warranty_period' => 'nullable|string',
        ])->validate();
    }

    public function store(Product $product, array $validatedData): void
    {
        if (!empty($validatedData)) {
            $product->watchSpec()->create($validatedData);
        }
    }

    public function update(Product $product, array $validatedData): void
    {
        if (!empty($validatedData)) {
            $product->watchSpec()->updateOrCreate(['product_id' => $product->id], $validatedData);
        }
    }
}

<?php

namespace App\Services\ProductSpecs;

use App\Models\Product;
use Illuminate\Support\Facades\Validator;

class DiamondStrategy implements SpecStrategyInterface
{
    public function validate(array $data, ?Product $product = null): array
    {
        return Validator::make($data, [
            'diamond_clarity' => 'nullable|string',
            'diamond_color' => 'nullable|string',
            'diamond_cut' => 'nullable|string',
            'diamond_setting' => 'nullable|string',
            'diamond_count' => 'nullable|integer',
        ])->validate();
    }

    public function store(Product $product, array $validatedData): void
    {
        if (!empty($validatedData)) {
            $product->diamondSpec()->create($validatedData);
        }
    }

    public function update(Product $product, array $validatedData): void
    {
        if (!empty($validatedData)) {
            $product->diamondSpec()->updateOrCreate(['product_id' => $product->id], $validatedData);
        }
    }
}

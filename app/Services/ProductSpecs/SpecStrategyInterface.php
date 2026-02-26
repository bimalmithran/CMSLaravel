<?php

namespace App\Services\ProductSpecs;

use App\Models\Product;

interface SpecStrategyInterface
{
    /**
     * Validate the incoming spec data. Passes the product if it's an update.
     */
    public function validate(array $data, ?Product $product = null): array;

    /**
     * Create the spec relation for a new product.
     */
    public function store(Product $product, array $validatedData): void;

    /**
     * Update or create the spec relation for an existing product.
     */
    public function update(Product $product, array $validatedData): void;
}

<?php

namespace App\Services;

use App\Models\ProductType;
use Illuminate\Database\Eloquent\Collection;

class ProductTypeService
{
    /**
     * Get a flat, active list of product types for frontend dropdowns.
     */
    public function getActiveProductTypes(): Collection
    {
        return ProductType::where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();
    }
}

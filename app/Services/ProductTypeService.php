<?php

namespace App\Services;

use App\Models\ProductType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ProductTypeService
{
    /**
     * Get paginated product types for admin data tables.
     */
    public function getPaginatedProductTypes(array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        $sortBy = $filters['sort_by'] ?? 'id';
        $sortOrder = $filters['sort_dir'] ?? 'desc';

        return ProductType::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('model_name', 'like', "%{$search}%");
            })
            ->orderBy($sortBy, $sortOrder)
            ->paginate(20);
    }

    /**
     * Get a flat, active list of product types for frontend dropdowns.
     */
    public function getActiveProductTypes(): Collection
    {
        return ProductType::where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Create a new product type.
     */
    public function createProductType(array $data): ProductType
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return ProductType::create($data);
    }

    /**
     * Get a product type by ID.
     */
    public function getProductTypeById(int $id): ProductType
    {
        return ProductType::findOrFail($id);
    }

    /**
     * Update an existing product type.
     */
    public function updateProductType(int $id, array $data): ProductType
    {
        $productType = $this->getProductTypeById($id);

        if (array_key_exists('name', $data) && (!array_key_exists('slug', $data) || $data['slug'] === null)) {
            $data['slug'] = Str::slug($data['name']);
        }

        $productType->update($data);

        return $productType->fresh();
    }

    /**
     * Delete a product type.
     */
    public function deleteProductType(int $id): void
    {
        $productType = $this->getProductTypeById($id);
        $productType->delete();
    }
}

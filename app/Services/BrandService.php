<?php

namespace App\Services;

use App\Models\Brand;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class BrandService
{
    public function getPaginatedBrands(array $filters): LengthAwarePaginator
    {
        $query = Brand::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['sort_by']) && !empty($filters['sort_dir'])) {
            $query->orderBy($filters['sort_by'], $filters['sort_dir']);
        } else {
            $query->orderBy('name', 'asc');
        }

        return $query->paginate(10);
    }

    public function createBrand(array $data): Brand
    {
        $data['slug'] = Str::slug($data['name']);
        return Brand::create($data);
    }

    public function getBrandById(int $id): Brand
    {
        return Brand::findOrFail($id);
    }

    public function updateBrand(int $id, array $data): Brand
    {
        $brand = $this->getBrandById($id);
        $data['slug'] = Str::slug($data['name']);

        $brand->update($data);

        return $brand;
    }

    public function deleteBrand(int $id): void
    {
        $brand = $this->getBrandById($id);
        $brand->delete();
    }
}

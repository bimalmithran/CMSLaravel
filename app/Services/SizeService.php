<?php

namespace App\Services;

use App\Models\Size;
use Illuminate\Pagination\LengthAwarePaginator;

class SizeService
{
    public function getPaginatedSizes(array $filters): LengthAwarePaginator
    {
        $query = Size::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%')
                ->orWhere('type', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['sort_by']) && !empty($filters['sort_dir'])) {
            $query->orderBy($filters['sort_by'], $filters['sort_dir']);
        } else {
            // Default sorting: group by type first, then alphabetically by name
            $query->orderBy('type', 'asc')->orderBy('name', 'asc');
        }

        return $query->paginate(10);
    }

    public function createSize(array $data): Size
    {
        return Size::create($data);
    }

    public function getSizeById(int $id): Size
    {
        return Size::findOrFail($id);
    }

    public function updateSize(int $id, array $data): Size
    {
        $size = $this->getSizeById($id);
        $size->update($data);

        return $size;
    }

    public function deleteSize(int $id): void
    {
        $size = $this->getSizeById($id);
        $size->delete();
    }
}

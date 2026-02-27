<?php

namespace App\Services;

use App\Models\Testimonial;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class TestimonialService
{
    public function getPaginatedTestimonials(array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        $sortBy = $filters['sort_by'] ?? 'sort_order';
        $sortOrder = ($filters['sort_dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['customer_name', 'rating', 'sort_order', 'is_active', 'updated_at'];

        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        return Testimonial::query()
            ->when($search, function ($query, $search): void {
                $query->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('designation_or_location', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            })
            ->orderBy($sortBy, $sortOrder)
            ->orderByDesc('id')
            ->paginate(10);
    }

    public function getById(int $id): Testimonial
    {
        return Testimonial::findOrFail($id);
    }

    public function create(array $data): Testimonial
    {
        return Testimonial::create([
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function update(int $id, array $data): Testimonial
    {
        $testimonial = $this->getById($id);
        $testimonial->update($data);

        return $testimonial->fresh();
    }

    public function delete(int $id): void
    {
        $testimonial = $this->getById($id);
        $testimonial->delete();
    }

    public function getActiveForStorefront(int $limit = 20): Collection
    {
        $limit = max(1, min(100, $limit));

        return Testimonial::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }
}


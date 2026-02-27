<?php

namespace App\Services;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class BannerService
{
    public function getPaginatedBanners(array $filters): LengthAwarePaginator
    {
        $query = Banner::query();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%")
                    ->orWhere('placement', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['placement'])) {
            $query->where('placement', $filters['placement']);
        }

        $sortBy = $filters['sort_by'] ?? null;
        $sortDir = ($filters['sort_dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['title', 'placement', 'sort_order', 'is_active', 'created_at'];

        if ($sortBy && in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query
                ->orderBy('placement')
                ->orderBy('sort_order')
                ->orderByDesc('id');
        }

        return $query->paginate(10);
    }

    public function getBannerById(int $id): Banner
    {
        return Banner::findOrFail($id);
    }

    public function createBanner(array $data): Banner
    {
        return Banner::create([
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateBanner(int $id, array $data): Banner
    {
        $banner = $this->getBannerById($id);
        $banner->update($data);

        return $banner;
    }

    public function deleteBanner(int $id): void
    {
        $banner = $this->getBannerById($id);
        $banner->delete();
    }

    public function getActiveBannersByPlacement(string $placement): Collection
    {
        return Banner::query()
            ->where('placement', $placement)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get();
    }
}

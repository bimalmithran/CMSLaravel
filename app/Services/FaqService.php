<?php

namespace App\Services;

use App\Models\Faq;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class FaqService
{
    public function getPaginatedFaqs(array $filters): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        $sortBy = $filters['sort_by'] ?? 'sort_order';
        $sortOrder = ($filters['sort_dir'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $allowedSorts = ['question', 'category', 'sort_order', 'is_active', 'updated_at'];

        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        return Faq::query()
            ->when($search, function ($query, $search): void {
                $query->where('question', 'like', "%{$search}%")
                    ->orWhere('answer', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            })
            ->orderBy($sortBy, $sortOrder)
            ->orderByDesc('id')
            ->paginate(10);
    }

    public function getById(int $id): Faq
    {
        return Faq::findOrFail($id);
    }

    public function create(array $data): Faq
    {
        return Faq::create([
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function update(int $id, array $data): Faq
    {
        $faq = $this->getById($id);
        $faq->update($data);

        return $faq->fresh();
    }

    public function delete(int $id): void
    {
        $faq = $this->getById($id);
        $faq->delete();
    }

    public function getActiveForStorefront(?string $category = null): Collection
    {
        return Faq::query()
            ->where('is_active', true)
            ->when($category, fn ($query) => $query->where('category', $category))
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get();
    }
}


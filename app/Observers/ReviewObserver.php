<?php

namespace App\Observers;

use App\Models\Review;

class ReviewObserver
{
    /**
     * Recompute the product's rating_avg and rating_count
     * whenever a review is created, updated, or deleted.
     */
    public function saved(Review $review): void
    {
        $this->recalculate($review->product_id);
    }

    public function deleted(Review $review): void
    {
        $this->recalculate($review->product_id);
    }

    private function recalculate(int $productId): void
    {
        $stats = Review::where('product_id', $productId)
            ->where('is_approved', true)
            ->selectRaw('COUNT(*) as cnt, AVG(rating) as avg_rating')
            ->first();

        \App\Models\Product::where('id', $productId)->update([
            'rating_avg'   => $stats->cnt > 0 ? round((float) $stats->avg_rating, 2) : 0,
            'rating_count' => $stats->cnt ?? 0,
        ]);
    }
}

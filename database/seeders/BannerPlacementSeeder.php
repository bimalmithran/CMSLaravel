<?php

namespace Database\Seeders;

use App\Models\BannerPlacement;
use Illuminate\Database\Seeder;

class BannerPlacementSeeder extends Seeder
{
    public function run(): void
    {
        $placements = [
            [
                'key' => 'homepage_hero',
                'label' => 'Homepage Hero',
                'description' => 'Full-width hero slider at the top of the homepage.',
                'sort_order' => 1,
            ],
            [
                'key' => 'homepage_featured_banner',
                'label' => 'Homepage Featured Banner',
                'description' => 'Single wide promotional banner shown below the new arrivals section.',
                'sort_order' => 2,
            ],
            [
                'key' => 'homepage_dual_banners',
                'label' => 'Homepage Dual Banners',
                'description' => 'Two side-by-side image banners (col-lg-6 each) shown mid-page.',
                'sort_order' => 3,
            ],
            [
                'key' => 'homepage_triple_banners',
                'label' => 'Homepage Triple Banners',
                'description' => 'Three equal-width image banners (col-lg-4 each) shown below the all-products section.',
                'sort_order' => 4,
            ],
            [
                'key' => 'homepage_sidebar',
                'label' => 'Homepage Sidebar',
                'description' => 'Sidebar banner on the homepage.',
                'sort_order' => 5,
            ],
            [
                'key' => 'checkout_sidebar',
                'label' => 'Checkout Sidebar',
                'description' => 'Promotional banner displayed in the checkout sidebar.',
                'sort_order' => 6,
            ],
            [
                'key' => 'category_top',
                'label' => 'Category Top',
                'description' => 'Banner shown at the top of category listing pages.',
                'sort_order' => 7,
            ],
        ];

        foreach ($placements as $placement) {
            BannerPlacement::firstOrCreate(
                ['key' => $placement['key']],
                array_merge($placement, ['is_active' => true]),
            );
        }
    }
}

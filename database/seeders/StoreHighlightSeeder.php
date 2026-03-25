<?php

namespace Database\Seeders;

use App\Models\StoreHighlight;
use Illuminate\Database\Seeder;

class StoreHighlightSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        StoreHighlight::create([
            'icon' => 'assets/images/shipping-icon/1.png',
            'title' => 'Free Uk Standard Delivery',
            'description' => 'Designated day delivery',
            'sort_order' => 1,
        ]);

        StoreHighlight::create([
            'icon' => 'assets/images/shipping-icon/2.png',
            'title' => 'Freshyly Prepared Ingredients',
            'description' => 'Made for your delivery date',
            'sort_order' => 2,
        ]);

        StoreHighlight::create([
            'icon' => 'assets/images/shipping-icon/3.png',
            'title' => '98% Of Anta Clients',
            'description' => 'Reach their personal goals set',
            'sort_order' => 3,
        ]);

        StoreHighlight::create([
            'icon' => 'assets/images/shipping-icon/4.png',
            'title' => 'Winner Of 15 Awards',
            'description' => 'Healthy food and drink 2022',
            'sort_order' => 4,
        ]);
    }
}

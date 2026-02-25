<?php

namespace Database\Seeders;

use App\Models\ProductType;
use Illuminate\Database\Seeder;

class ProductTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Jewelry',
                'slug' => 'jewelry',
                'model_name' => 'JewelrySpec',
                'is_active' => true,
            ],
            [
                'name' => 'Premium Watch',
                'slug' => 'watch',
                'model_name' => 'WatchSpec',
                'is_active' => true,
            ],
            [
                'name' => 'Diamond',
                'slug' => 'diamond',
                'model_name' => 'DiamondSpec',
                'is_active' => true,
            ],
        ];

        foreach ($types as $type) {
            ProductType::firstOrCreate(
                ['slug' => $type['slug']], // Check if this slug already exists
                $type                      // If not, create it with this data
            );
        }
    }
}

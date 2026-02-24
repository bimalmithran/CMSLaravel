<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Gold Jewelry', 'description' => 'Premium gold jewelry collection', 'order' => 1],
            ['name' => 'Silver Jewelry', 'description' => 'Elegant silver jewelry designs', 'order' => 2],
            ['name' => 'Diamond Collection', 'description' => 'Luxury diamond jewelry', 'order' => 3],
            ['name' => 'Earrings', 'description' => 'Beautiful earring designs', 'order' => 4],
            ['name' => 'Necklaces', 'description' => 'Stunning necklace collection', 'order' => 5],
            ['name' => 'Bracelets', 'description' => 'Elegant bracelets for all occasions', 'order' => 6],
            ['name' => 'Rings', 'description' => 'Beautiful rings collection', 'order' => 7],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                [
                    'slug' => Category::generateSlug($category['name']),
                    'description' => $category['description'],
                    'order' => $category['order'],
                    'is_active' => true,
                ]
            );
        }
    }
}


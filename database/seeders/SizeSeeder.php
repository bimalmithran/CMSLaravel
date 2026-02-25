<?php

namespace Database\Seeders;

use App\Models\Size;
use Illuminate\Database\Seeder;

class SizeSeeder extends Seeder
{
    public function run(): void
    {
        $sizes = [
            // Bangle Sizes (Common Indian measurements)
            ['name' => '2.2', 'type' => 'bangle'],
            ['name' => '2.4', 'type' => 'bangle'],
            ['name' => '2.6', 'type' => 'bangle'],
            ['name' => '2.8', 'type' => 'bangle'],
            ['name' => '2.10', 'type' => 'bangle'],

            // Ring Sizes (Indian standard)
            ['name' => 'Size 10', 'type' => 'ring'],
            ['name' => 'Size 12', 'type' => 'ring'],
            ['name' => 'Size 14', 'type' => 'ring'],
            ['name' => 'Size 16', 'type' => 'ring'],
            ['name' => 'Size 18', 'type' => 'ring'],
            ['name' => 'Size 20', 'type' => 'ring'],

            // Chain/Necklace Lengths
            ['name' => '16 Inch', 'type' => 'chain'],
            ['name' => '18 Inch', 'type' => 'chain'],
            ['name' => '20 Inch', 'type' => 'chain'],
            ['name' => '22 Inch', 'type' => 'chain'],
            ['name' => '24 Inch', 'type' => 'chain'],
        ];

        foreach ($sizes as $size) {
            Size::firstOrCreate(
                ['name' => $size['name'], 'type' => $size['type']],
                $size
            );
        }
    }
}

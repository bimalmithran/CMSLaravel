<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class FooterMenuSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedMenu('footer-product', 'Footer Product', [
            'Prices Drop',
            'New Products',
            'Best Sales',
            'Contact Us',
        ]);

        $this->seedMenu('footer-bottom', 'Footer Bottom', [
            'Online Shopping',
            'Promotions',
            'My Orders',
            'Help',
            'Customer Service',
            'Support',
            'Most Populars',
            'New Arrivals',
            'Special Products',
            'Manufacturers',
            'Our Stores',
            'Shipping',
            'Payments',
            'Warranty',
            'Refunds',
            'Checkout',
            'Discount',
            'Policy Shipping',
        ]);

        $this->seedMenu('footer-policies', 'OUR POLICIES', [
            'Terms And Condition',
            'Buyback Policies',
            'Cancellation Policies',
            'Refund Policies',
            'Privacy Policy',
            'Shipping Policy',
        ]);
    }

    /**
     * Create or update a root menu and its child link items.
     *
     * @param  string    $slug
     * @param  string    $name
     * @param  string[]  $children
     */
    private function seedMenu(string $slug, string $name, array $children): void
    {
        $parent = Menu::updateOrCreate(
            ['slug' => $slug],
            [
                'name'      => $name,
                'menu_type' => Menu::TYPE_DROPDOWN,
                'placement' => Menu::PLACEMENT_FOOTER,
                'is_active' => true,
                'position'  => 0,
            ]
        );

        foreach ($children as $position => $label) {
            Menu::updateOrCreate(
                ['slug' => Menu::generateSlug($slug . '-' . $label)],
                [
                    'name'      => $label,
                    'menu_type' => Menu::TYPE_LINK,
                    'parent_id' => $parent->id,
                    'is_active' => true,
                    'position'  => $position,
                ]
            );
        }
    }
}

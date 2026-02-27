<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Group
            ['key' => 'site_name', 'value' => 'My Awesome Store', 'type' => 'text', 'group' => 'general'],
            ['key' => 'site_logo', 'value' => null, 'type' => 'image', 'group' => 'general'],
            ['key' => 'site_favicon', 'value' => null, 'type' => 'image', 'group' => 'general'],
            
            // Contact Group
            ['key' => 'contact_email', 'value' => 'info@example.com', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+1 234 567 8900', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => '123 Main St, City, Country', 'type' => 'textarea', 'group' => 'contact'],
            
            // Social Group
            ['key' => 'social_facebook', 'value' => 'https://facebook.com', 'type' => 'text', 'group' => 'social'],
            ['key' => 'social_instagram', 'value' => 'https://instagram.com', 'type' => 'text', 'group' => 'social'],

            // Store Group
            ['key' => 'store_tax_id', 'value' => null, 'type' => 'text', 'group' => 'store'],
            ['key' => 'support_whatsapp', 'value' => null, 'type' => 'text', 'group' => 'store'],
            ['key' => 'currency_symbol', 'value' => '$', 'type' => 'text', 'group' => 'store'],
            ['key' => 'store_timezone', 'value' => 'UTC', 'type' => 'text', 'group' => 'store'],

            // SEO Group
            ['key' => 'default_meta_title', 'value' => 'Premium Jewelry & Diamonds', 'type' => 'text', 'group' => 'seo'],
            ['key' => 'default_meta_description', 'value' => 'Discover premium jewelry, diamonds, and timepieces crafted for timeless elegance.', 'type' => 'textarea', 'group' => 'seo'],
            ['key' => 'default_og_image', 'value' => null, 'type' => 'image', 'group' => 'seo'],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}

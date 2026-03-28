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
            ['key' => 'site_description', 'value' => 'We are a team of designers and developers that create high quality products.', 'type' => 'textarea', 'group' => 'general'],
            ['key' => 'site_logo', 'value' => null, 'type' => 'image', 'group' => 'general'],
            ['key' => 'site_favicon', 'value' => null, 'type' => 'image', 'group' => 'general'],

            // Contact Group
            ['key' => 'contact_email', 'value' => 'info@example.com', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+1 234 567 8900', 'type' => 'text', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => '123 Main St, City, Country', 'type' => 'textarea', 'group' => 'contact'],
            
            // Social Group
            ['key' => 'social_facebook', 'value' => 'https://facebook.com', 'type' => 'text', 'group' => 'social'],
            ['key' => 'social_instagram', 'value' => 'https://instagram.com', 'type' => 'text', 'group' => 'social'],
            ['key' => 'social_twitter', 'value' => null, 'type' => 'text', 'group' => 'social'],

            // Store Group
            ['key' => 'store_tax_id', 'value' => null, 'type' => 'text', 'group' => 'store'],
            ['key' => 'support_whatsapp', 'value' => null, 'type' => 'text', 'group' => 'store'],
            ['key' => 'currency_symbol', 'value' => '$', 'type' => 'text', 'group' => 'store'],
            ['key' => 'store_timezone', 'value' => 'UTC', 'type' => 'text', 'group' => 'store'],

            // About Us Group
            ['key' => 'about_intro', 'value' => 'Nestled in the heart of Kunnamkulam, TT Devassy Jewellery has been a trusted name in fine jewellery for generations. We specialise in exquisitely crafted gold, diamond, and silver jewellery that celebrates life\'s most cherished moments — from weddings and engagements to everyday elegance.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_story', 'value' => 'TT Devassy Jewellery was founded with a simple belief — that every person deserves jewellery that tells their story. From humble beginnings as a small goldsmith\'s workshop in Kunnamkulam, we have grown into one of the region\'s most respected jewellery destinations. Over decades, we have built a reputation for quality, transparency, and artistry. Whether you\'re looking for a traditional bridal set, an elegant diamond necklace, or a custom-designed piece, our team is here to make your vision a reality.', 'type' => 'textarea', 'group' => 'about'],
            ['key' => 'about_years_legacy', 'value' => '50', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_unique_designs', 'value' => '1200', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_master_artisans', 'value' => '25', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_happy_customers', 'value' => '10000', 'type' => 'text', 'group' => 'about'],
            ['key' => 'about_image', 'value' => null, 'type' => 'image', 'group' => 'about'],

            // Contact Page Group
            ['key' => 'contact_intro', 'value' => 'We\'d love to hear from you! Whether you have a question about a product, need help with your order, or want to discuss a custom design, our team is here to help.', 'type' => 'textarea', 'group' => 'contact'],
            ['key' => 'contact_store_hours', 'value' => "Monday – Saturday: 9:30 AM – 7:30 PM\nSunday: 10:00 AM – 5:00 PM", 'type' => 'textarea', 'group' => 'contact'],
            ['key' => 'contact_whatsapp', 'value' => null, 'type' => 'text', 'group' => 'contact'],

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

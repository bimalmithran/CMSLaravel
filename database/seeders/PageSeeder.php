<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'title' => 'About Us',
                'slug' => 'about-us',
                'content' => '<h2>About Us</h2><p>Tell your brand story here.</p>',
                'meta_title' => 'About Us',
                'meta_description' => 'Learn more about our store and values.',
                'is_active' => true,
            ],
            [
                'title' => 'Terms and Conditions',
                'slug' => 'terms-and-conditions',
                'content' => '<h2>Terms and Conditions</h2><p>Add your terms and conditions here.</p>',
                'meta_title' => 'Terms and Conditions',
                'meta_description' => 'Read our terms and conditions.',
                'is_active' => true,
            ],
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'content' => '<h2>Privacy Policy</h2><p>Add your privacy policy here.</p>',
                'meta_title' => 'Privacy Policy',
                'meta_description' => 'Read how we collect and process your data.',
                'is_active' => true,
            ],
        ];

        foreach ($pages as $page) {
            Page::updateOrCreate(
                ['slug' => $page['slug']],
                $page
            );
        }
    }
}


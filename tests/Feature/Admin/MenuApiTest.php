<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MenuApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_link_menu_with_single_page_reference(): void
    {
        Sanctum::actingAs($this->createAdminUser(), [], 'admin-api');

        $page = Page::create([
            'title' => 'About Us',
            'slug' => 'about-us',
            'content' => '<p>About</p>',
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/admin/menus', [
            'name' => 'About',
            'slug' => 'about',
            'menu_type' => Menu::TYPE_LINK,
            'page_id' => $page->id,
            'is_active' => true,
            'position' => 1,
        ])->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.menu_type', Menu::TYPE_LINK)
            ->assertJsonPath('data.page_id', $page->id);

        $this->postJson('/api/v1/admin/menus', [
            'name' => 'About Duplicate',
            'slug' => 'about-duplicate',
            'menu_type' => Menu::TYPE_LINK,
            'page_id' => $page->id,
        ])->assertStatus(422);
    }

    public function test_public_menus_endpoint_returns_dynamic_menu_structure(): void
    {
        config(['services.storefront.key' => 'test-storefront-key']);

        $aboutPage = Page::create([
            'title' => 'About Us',
            'slug' => 'about-us',
            'content' => '<p>About</p>',
            'is_active' => true,
        ]);
        $carePage = Page::create([
            'title' => 'Care Guide',
            'slug' => 'care-guide',
            'content' => '<p>Care</p>',
            'is_active' => true,
        ]);

        $shopMenu = Menu::create([
            'name' => 'Shop',
            'slug' => 'shop',
            'menu_type' => Menu::TYPE_PRODUCT_LISTING,
            'is_active' => true,
            'position' => 1,
        ]);

        $aboutMenu = Menu::create([
            'name' => 'About',
            'slug' => 'about',
            'menu_type' => Menu::TYPE_LINK,
            'page_id' => $aboutPage->id,
            'is_active' => true,
            'position' => 2,
        ]);

        $careDropdown = Menu::create([
            'name' => 'Care',
            'slug' => 'care',
            'menu_type' => Menu::TYPE_DROPDOWN,
            'is_active' => true,
            'position' => 3,
        ]);

        Menu::create([
            'name' => 'Care Guide',
            'slug' => 'care-guide-menu',
            'menu_type' => Menu::TYPE_LINK,
            'page_id' => $carePage->id,
            'parent_id' => $careDropdown->id,
            'is_active' => true,
            'position' => 1,
        ]);

        Category::create([
            'name' => 'Rings',
            'slug' => 'rings',
            'description' => 'Ring collection',
            'is_active' => true,
            'order' => 1,
        ]);
        Category::create([
            'name' => 'Hidden Draft Category',
            'slug' => 'hidden-draft-category',
            'description' => 'Draft',
            'is_active' => false,
            'order' => 2,
        ]);

        $this->getJson('/api/v1/menus', [
            'X-Storefront-Key' => 'test-storefront-key',
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.id', $shopMenu->id)
            ->assertJsonPath('data.0.menu_type', Menu::TYPE_PRODUCT_LISTING)
            ->assertJsonPath('data.0.product_categories.0.slug', 'rings')
            ->assertJsonPath('data.1.id', $aboutMenu->id)
            ->assertJsonPath('data.1.url', '/about-us.php')
            ->assertJsonPath('data.2.id', $careDropdown->id)
            ->assertJsonPath('data.2.children.0.url', '/care-guide.php')
            ->assertJsonMissing(['slug' => 'hidden-draft-category']);
    }

    private function createAdminUser(): AdminUser
    {
        return AdminUser::create([
            'name' => 'Menu Admin',
            'email' => 'menu-admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}

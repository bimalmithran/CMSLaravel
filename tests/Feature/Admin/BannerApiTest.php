<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Banner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BannerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_banners(): void
    {
        Sanctum::actingAs($this->createAdminUser(), [], 'admin-api');

        $create = $this->postJson('/api/v1/admin/banners', [
            'title' => 'Summer Sale',
            'subtitle' => 'Up to 50% off',
            'action_url' => 'https://example.com/sale',
            'image_path' => '/storage/uploads/sale.webp',
            'placement' => 'homepage_hero',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $create->assertStatus(201)->assertJsonPath('success', true);
        $bannerId = (int) $create->json('data.id');

        $this->getJson('/api/v1/admin/banners')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->putJson("/api/v1/admin/banners/{$bannerId}", [
            'title' => 'Updated Summer Sale',
            'sort_order' => 2,
        ])->assertOk()->assertJsonPath('data.title', 'Updated Summer Sale');

        $this->deleteJson("/api/v1/admin/banners/{$bannerId}")
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_public_banners_endpoint_filters_by_placement_and_active_state(): void
    {
        Banner::create([
            'title' => 'Hero 1',
            'subtitle' => null,
            'action_url' => null,
            'image_path' => '/storage/uploads/hero1.webp',
            'placement' => 'homepage_hero',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Banner::create([
            'title' => 'Hero 2',
            'subtitle' => null,
            'action_url' => null,
            'image_path' => '/storage/uploads/hero2.webp',
            'placement' => 'homepage_hero',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Banner::create([
            'title' => 'Inactive',
            'subtitle' => null,
            'action_url' => null,
            'image_path' => '/storage/uploads/inactive.webp',
            'placement' => 'homepage_hero',
            'sort_order' => 0,
            'is_active' => false,
        ]);

        Banner::create([
            'title' => 'Other Placement',
            'subtitle' => null,
            'action_url' => null,
            'image_path' => '/storage/uploads/other.webp',
            'placement' => 'checkout_sidebar',
            'sort_order' => 0,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/banners?placement=homepage_hero');
        $response->assertOk()->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertCount(2, $data);
        $this->assertSame('Hero 2', $data[0]['title']);
        $this->assertSame('Hero 1', $data[1]['title']);
    }

    private function createAdminUser(): AdminUser
    {
        return AdminUser::create([
            'name' => 'Test Admin',
            'email' => 'banner-admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}


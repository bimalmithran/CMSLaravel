<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\StoreHighlight;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StoreHighlightApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_store_highlights(): void
    {
        Sanctum::actingAs($this->createAdminUser(), [], 'admin-api');

        $create = $this->postJson('/api/v1/admin/store-highlights', [
            'icon' => '/storage/uploads/highlights/free-delivery.png',
            'title' => 'Free Delivery',
            'description' => 'Delivered to your door on your chosen date.',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $create->assertStatus(201)->assertJsonPath('success', true);
        $id = (int) $create->json('data.id');

        $this->getJson('/api/v1/admin/store-highlights')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.max_active', 4);

        $this->putJson("/api/v1/admin/store-highlights/{$id}", [
            'title' => 'Free Scheduled Delivery',
            'description' => 'Updated description',
        ])->assertOk()->assertJsonPath('data.title', 'Free Scheduled Delivery');

        $this->deleteJson("/api/v1/admin/store-highlights/{$id}")
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_public_endpoint_returns_only_active_store_highlights_in_sort_order(): void
    {
        config(['services.storefront.key' => 'test-storefront-key']);

        StoreHighlight::create([
            'icon' => '/images/one.png',
            'title' => 'Third',
            'description' => 'Third card',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        StoreHighlight::create([
            'icon' => '/images/two.png',
            'title' => 'Hidden',
            'description' => 'Inactive card',
            'sort_order' => 1,
            'is_active' => false,
        ]);

        StoreHighlight::create([
            'icon' => '/images/three.png',
            'title' => 'First',
            'description' => 'First card',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->withHeaders([
            'X-Storefront-Key' => 'test-storefront-key',
        ])->getJson('/api/v1/store-highlights');

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertCount(2, $response->json('data'));
        $this->assertSame('First', $response->json('data.0.title'));
        $this->assertSame('Third', $response->json('data.1.title'));
    }

    public function test_admin_cannot_activate_more_than_four_store_highlights(): void
    {
        Sanctum::actingAs($this->createAdminUser(), [], 'admin-api');

        foreach (range(1, 4) as $index) {
            StoreHighlight::create([
                'icon' => "/images/{$index}.png",
                'title' => "Highlight {$index}",
                'description' => "Description {$index}",
                'sort_order' => $index,
                'is_active' => true,
            ]);
        }

        $this->postJson('/api/v1/admin/store-highlights', [
            'icon' => '/images/five.png',
            'title' => 'Highlight 5',
            'description' => 'Should fail',
            'sort_order' => 5,
            'is_active' => true,
        ])->assertStatus(422)->assertJsonValidationErrors(['is_active']);
    }

    private function createAdminUser(): AdminUser
    {
        return AdminUser::create([
            'name' => 'Store Highlights Admin',
            'email' => 'store-highlights-admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}

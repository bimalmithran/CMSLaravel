<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TestimonialApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_testimonials(): void
    {
        Sanctum::actingAs($this->createAdminUser(), [], 'admin-api');

        $create = $this->postJson('/api/v1/admin/testimonials', [
            'customer_name' => 'Priya S.',
            'designation_or_location' => 'Verified Buyer',
            'content' => 'Amazing quality and finish.',
            'rating' => 5,
            'image_path' => '/storage/uploads/review.webp',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $create->assertStatus(201)->assertJsonPath('success', true);
        $id = (int) $create->json('data.id');

        $this->getJson('/api/v1/admin/testimonials')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->putJson("/api/v1/admin/testimonials/{$id}", [
            'content' => 'Updated review content',
            'rating' => 4,
        ])->assertOk()->assertJsonPath('data.rating', 4);

        $this->deleteJson("/api/v1/admin/testimonials/{$id}")
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_public_endpoint_returns_only_active_testimonials(): void
    {
        Testimonial::create([
            'customer_name' => 'Active User',
            'content' => 'Great store',
            'rating' => 5,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Testimonial::create([
            'customer_name' => 'Inactive User',
            'content' => 'Hidden',
            'rating' => 4,
            'sort_order' => 2,
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/v1/testimonials');
        $response->assertOk()->assertJsonPath('success', true);
        $this->assertCount(1, $response->json('data'));
    }

    private function createAdminUser(): AdminUser
    {
        return AdminUser::create([
            'name' => 'Testimonials Admin',
            'email' => 'testimonials-admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}


<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Faq;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FaqApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_faqs(): void
    {
        Sanctum::actingAs($this->createAdminUser(), [], 'admin-api');

        $create = $this->postJson('/api/v1/admin/faqs', [
            'question' => 'What is your return policy?',
            'answer' => '<p>Return within 7 days.</p>',
            'category' => 'Returns',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $create->assertStatus(201)->assertJsonPath('success', true);
        $id = (int) $create->json('data.id');

        $this->getJson('/api/v1/admin/faqs')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->putJson("/api/v1/admin/faqs/{$id}", [
            'answer' => '<p>Updated return policy.</p>',
            'category' => 'Policies',
        ])->assertOk()->assertJsonPath('data.category', 'Policies');

        $this->deleteJson("/api/v1/admin/faqs/{$id}")
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_public_endpoint_filters_active_faqs_by_category(): void
    {
        Faq::create([
            'question' => 'Shipping time?',
            'answer' => '<p>3-5 business days.</p>',
            'category' => 'Shipping',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Faq::create([
            'question' => 'Inactive FAQ',
            'answer' => '<p>Hidden.</p>',
            'category' => 'Shipping',
            'sort_order' => 2,
            'is_active' => false,
        ]);

        Faq::create([
            'question' => 'Other category FAQ',
            'answer' => '<p>Care info.</p>',
            'category' => 'Care',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/faqs?category=Shipping');
        $response->assertOk()->assertJsonPath('success', true);
        $this->assertCount(1, $response->json('data'));
    }

    private function createAdminUser(): AdminUser
    {
        return AdminUser::create([
            'name' => 'Faq Admin',
            'email' => 'faq-admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}


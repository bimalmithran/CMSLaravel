<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PageApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_pages(): void
    {
        Sanctum::actingAs($this->createAdminUser(), [], 'admin-api');

        $createResponse = $this->postJson('/api/v1/admin/pages', [
            'title' => 'Terms and Conditions',
            'slug' => 'terms-and-conditions',
            'content' => '<h2>Terms</h2><p>Sample</p>',
            'meta_title' => 'Terms',
            'meta_description' => 'Terms page',
            'is_active' => true,
        ]);

        $createResponse->assertStatus(201)->assertJsonPath('success', true);
        $pageId = (int) $createResponse->json('data.id');

        $this->getJson('/api/v1/admin/pages')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->putJson("/api/v1/admin/pages/{$pageId}", [
            'title' => 'Updated Terms and Conditions',
            'content' => '<h2>Updated Terms</h2>',
            'is_active' => false,
        ])->assertOk()->assertJsonPath('data.title', 'Updated Terms and Conditions');

        $this->deleteJson("/api/v1/admin/pages/{$pageId}")
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_public_pages_endpoint_returns_only_active_pages(): void
    {
        Page::create([
            'title' => 'Privacy Policy',
            'slug' => 'privacy-policy',
            'content' => '<p>Policy</p>',
            'is_active' => true,
        ]);

        Page::create([
            'title' => 'Draft Internal',
            'slug' => 'draft-internal',
            'content' => '<p>Draft</p>',
            'is_active' => false,
        ]);

        $this->getJson('/api/v1/pages/privacy-policy')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'privacy-policy');

        $this->getJson('/api/v1/pages/draft-internal')
            ->assertStatus(404);
    }

    private function createAdminUser(): AdminUser
    {
        return AdminUser::create([
            'name' => 'Page Admin',
            'email' => 'page-admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}


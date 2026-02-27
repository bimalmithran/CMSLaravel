<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\ContentBlock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContentBlockApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_content_blocks(): void
    {
        Sanctum::actingAs($this->createAdminUser(), [], 'admin-api');

        $createResponse = $this->postJson('/api/v1/admin/content-blocks', [
            'name' => 'Footer Newsletter CTA',
            'identifier' => 'footer_newsletter_cta',
            'type' => 'html',
            'content' => '<p>Join newsletter</p>',
            'is_active' => true,
        ]);

        $createResponse->assertStatus(201)->assertJsonPath('success', true);
        $id = (int) $createResponse->json('data.id');

        $this->getJson('/api/v1/admin/content-blocks')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->putJson("/api/v1/admin/content-blocks/{$id}", [
            'name' => 'Footer Newsletter CTA Updated',
            'type' => 'text',
            'content' => 'Join now',
        ])->assertOk()->assertJsonPath('data.name', 'Footer Newsletter CTA Updated');

        $this->deleteJson("/api/v1/admin/content-blocks/{$id}")
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_public_endpoint_returns_only_active_identifier_block(): void
    {
        ContentBlock::create([
            'name' => 'Shipping Notice',
            'identifier' => 'holiday_shipping_notice',
            'type' => 'text',
            'content' => 'Orders may delay by 2 days.',
            'is_active' => true,
        ]);

        ContentBlock::create([
            'name' => 'Internal Draft',
            'identifier' => 'internal_draft',
            'type' => 'text',
            'content' => 'Draft only',
            'is_active' => false,
        ]);

        $this->getJson('/api/v1/content-blocks/holiday_shipping_notice')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.identifier', 'holiday_shipping_notice');

        $this->getJson('/api/v1/content-blocks/internal_draft')
            ->assertStatus(404);
    }

    private function createAdminUser(): AdminUser
    {
        return AdminUser::create([
            'name' => 'Block Admin',
            'email' => 'block-admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}


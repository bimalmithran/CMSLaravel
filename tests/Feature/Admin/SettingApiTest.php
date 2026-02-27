<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Media;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SettingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_and_update_settings(): void
    {
        $admin = $this->createAdminUser();
        Sanctum::actingAs($admin, [], 'admin-api');

        $siteName = Setting::create([
            'key' => 'site_name',
            'value' => 'Old',
            'type' => 'text',
            'group' => 'general',
        ]);

        $response = $this->getJson('/api/v1/admin/settings');
        $response->assertOk()->assertJsonPath('success', true);

        $updateResponse = $this->putJson('/api/v1/admin/settings/bulk', [
            'settings' => [
                ['id' => $siteName->id, 'value' => 'New Store Name'],
            ],
        ]);

        $updateResponse->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('settings', [
            'id' => $siteName->id,
            'value' => 'New Store Name',
        ]);
    }

    public function test_image_setting_stores_media_reference_and_path(): void
    {
        $admin = $this->createAdminUser();
        Sanctum::actingAs($admin, [], 'admin-api');

        $media = Media::create([
            'disk' => 'public',
            'file_name' => 'logo.webp',
            'path' => '/storage/uploads/logo.webp',
            'mime_type' => 'image/webp',
            'size' => 1200,
        ]);

        $siteLogo = Setting::create([
            'key' => 'site_logo',
            'value' => null,
            'media_id' => null,
            'type' => 'image',
            'group' => 'general',
        ]);

        $response = $this->putJson('/api/v1/admin/settings/bulk', [
            'settings' => [
                ['id' => $siteLogo->id, 'value' => '/stale/path.jpg', 'media_id' => $media->id],
            ],
        ]);

        $response->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('settings', [
            'id' => $siteLogo->id,
            'media_id' => $media->id,
            'value' => '/storage/uploads/logo.webp',
        ]);
    }

    public function test_bulk_update_rejects_invalid_boolean_value(): void
    {
        $admin = $this->createAdminUser();
        Sanctum::actingAs($admin, [], 'admin-api');

        $toggle = Setting::create([
            'key' => 'maintenance_mode',
            'value' => '0',
            'type' => 'boolean',
            'group' => 'general',
        ]);

        $response = $this->putJson('/api/v1/admin/settings/bulk', [
            'settings' => [
                ['id' => $toggle->id, 'value' => 'not-a-boolean'],
            ],
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseHas('settings', [
            'id' => $toggle->id,
            'value' => '0',
        ]);
    }

    public function test_bulk_update_rejects_media_id_for_non_image_setting(): void
    {
        $admin = $this->createAdminUser();
        Sanctum::actingAs($admin, [], 'admin-api');

        $media = Media::create([
            'disk' => 'public',
            'file_name' => 'file.webp',
            'path' => '/storage/uploads/file.webp',
            'mime_type' => 'image/webp',
            'size' => 1200,
        ]);

        $textSetting = Setting::create([
            'key' => 'contact_email',
            'value' => 'info@example.com',
            'type' => 'text',
            'group' => 'contact',
        ]);

        $response = $this->putJson('/api/v1/admin/settings/bulk', [
            'settings' => [
                ['id' => $textSetting->id, 'value' => 'support@example.com', 'media_id' => $media->id],
            ],
        ]);

        $response->assertStatus(422);
    }

    public function test_public_endpoint_returns_cached_key_value_settings_and_refreshes_after_update(): void
    {
        $siteName = Setting::create([
            'key' => 'site_name',
            'value' => 'Old Name',
            'type' => 'text',
            'group' => 'general',
        ]);

        $maintenance = Setting::create([
            'key' => 'maintenance_mode',
            'value' => '0',
            'type' => 'boolean',
            'group' => 'store',
        ]);

        $publicResponse = $this->getJson('/api/v1/settings/global');
        $publicResponse->assertOk()->assertJsonPath('success', true);
        $publicResponse->assertJsonPath('data.site_name', 'Old Name');
        $publicResponse->assertJsonPath('data.maintenance_mode', false);

        $admin = $this->createAdminUser();
        Sanctum::actingAs($admin, [], 'admin-api');

        $this->putJson('/api/v1/admin/settings/bulk', [
            'settings' => [
                ['id' => $siteName->id, 'value' => 'New Name'],
                ['id' => $maintenance->id, 'value' => true],
            ],
        ])->assertOk();

        $updatedPublicResponse = $this->getJson('/api/v1/settings/global');
        $updatedPublicResponse->assertOk()->assertJsonPath('success', true);
        $updatedPublicResponse->assertJsonPath('data.site_name', 'New Name');
        $updatedPublicResponse->assertJsonPath('data.maintenance_mode', true);
    }

    private function createAdminUser(): AdminUser
    {
        return AdminUser::create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}

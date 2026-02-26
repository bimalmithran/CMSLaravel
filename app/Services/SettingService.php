<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    public function getAllSettings(): Collection
    {
        return Cache::rememberForever('global_settings', function () {
            return Setting::all();
        });
    }

    public function bulkUpdateSettings(array $settingsData): void
    {
        foreach ($settingsData as $data) {
            Setting::where('id', $data['id'])->update([
                'value' => $data['value']
            ]);
        }

        Cache::forget('global_settings');
    }
}

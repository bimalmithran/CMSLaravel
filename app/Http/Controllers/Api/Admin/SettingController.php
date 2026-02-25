<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        // Pro-tip: Cache this query forever, and only clear the cache when an admin saves new settings!
        $settings = Setting::all();

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    public function bulkUpdate(Request $request)
    {
        // Validate that we are receiving an array of settings
        $request->validate([
            'settings' => 'required|array',
            'settings.*.id' => 'required|exists:settings,id',
            'settings.*.value' => 'nullable|string',
        ]);

        // Loop through and update each setting
        foreach ($request->settings as $settingData) {
            Setting::where('id', $settingData['id'])->update([
                'value' => $settingData['value']
            ]);
        }

        // Clear the cache so the public storefront gets the fresh settings immediately
        Cache::forget('global_settings');

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully'
        ]);
    }
}

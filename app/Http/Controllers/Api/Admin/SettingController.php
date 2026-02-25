<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        // Pro-tip: Cache this query forever, and only clear the cache when an admin saves new settings!
        $settings = Cache::rememberForever('global_settings', function () {
            return Setting::pluck('value', 'key')->toArray();
        });

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

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
}

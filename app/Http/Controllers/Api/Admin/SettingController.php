<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkUpdateSettingRequest;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(
        private readonly SettingService $settingService
    ) {}

    public function index(): JsonResponse
    {
        $settings = $this->settingService->getAllSettings();

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    public function bulkUpdate(BulkUpdateSettingRequest $request): JsonResponse
    {
        $this->settingService->bulkUpdateSettings($request->validated('settings'));

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully'
        ]);
    }
}

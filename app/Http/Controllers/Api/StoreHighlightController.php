<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StoreHighlightService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreHighlightController extends Controller
{
    public function __construct(
        private readonly StoreHighlightService $storeHighlightService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', StoreHighlightService::MAX_ACTIVE);
        $data = $this->storeHighlightService->getActiveForStorefront($limit);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BannerService;
use App\Http\Resources\StorefrontBannerResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function __construct(
        private readonly BannerService $bannerService
    ) {}

    public function byPlacement(Request $request): JsonResponse
    {
        $placement = $request->string('placement')->toString();

        if ($placement === '') {
            return response()->json([
                'success' => false,
                'message' => 'The placement query parameter is required.',
            ], 422);
        }

        // 1. Fetch the data using your shared service
        $banners = $this->bannerService->getActiveBannersByPlacement($placement);

        // 2. Transform the data for the public storefront
        return response()->json([
            'success' => true,
            'data' => StorefrontBannerResource::collection($banners),
        ]);
    }
}

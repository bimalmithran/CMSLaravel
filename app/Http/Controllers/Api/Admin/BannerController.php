<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBannerRequest;
use App\Http\Requests\UpdateBannerRequest;
use App\Services\BannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function __construct(
        private readonly BannerService $bannerService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $banners = $this->bannerService->getPaginatedBanners(
            $request->only(['search', 'placement', 'sort_by', 'sort_dir'])
        );

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }

    public function store(StoreBannerRequest $request): JsonResponse
    {
        $banner = $this->bannerService->createBanner($request->validated());

        return response()->json([
            'success' => true,
            'data' => $banner,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $banner = $this->bannerService->getBannerById($id);

        return response()->json([
            'success' => true,
            'data' => $banner,
        ]);
    }

    public function update(UpdateBannerRequest $request, int $id): JsonResponse
    {
        $banner = $this->bannerService->updateBanner($id, $request->validated());

        return response()->json([
            'success' => true,
            'data' => $banner,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->bannerService->deleteBanner($id);

        return response()->json([
            'success' => true,
            'message' => 'Banner deleted',
        ]);
    }
}

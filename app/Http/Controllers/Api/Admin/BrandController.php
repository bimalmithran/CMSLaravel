<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Services\BrandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function __construct(
        private readonly BrandService $brandService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $brands = $this->brandService->getPaginatedBrands($request->only(['search', 'sort_by', 'sort_dir']));

        return response()->json([
            'success' => true,
            'data' => $brands
        ]);
    }

    public function store(StoreBrandRequest $request): JsonResponse
    {
        $brand = $this->brandService->createBrand($request->validated());

        return response()->json(['success' => true, 'data' => $brand]);
    }

    public function show($id): JsonResponse
    {
        $brand = $this->brandService->getBrandById($id);

        return response()->json(['success' => true, 'data' => $brand]);
    }

    public function update(UpdateBrandRequest $request, $id): JsonResponse
    {
        $brand = $this->brandService->updateBrand($id, $request->validated());

        return response()->json(['success' => true, 'data' => $brand]);
    }

    public function destroy($id): JsonResponse
    {
        $this->brandService->deleteBrand($id);

        return response()->json(['success' => true, 'message' => 'Brand deleted']);
    }
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductTypeRequest;
use App\Http\Requests\UpdateProductTypeRequest;
use App\Services\ProductTypeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductTypeController extends Controller
{
    public function __construct(
        private readonly ProductTypeService $productTypeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $productTypes = $this->productTypeService->getPaginatedProductTypes($request->only(['search', 'sort_by', 'sort_dir']));

        return response()->json(['success' => true, 'data' => $productTypes]);
    }

    public function list(): JsonResponse
    {
        $types = $this->productTypeService->getActiveProductTypes();

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }

    public function store(StoreProductTypeRequest $request): JsonResponse
    {
        $productType = $this->productTypeService->createProductType($request->validated());

        return response()->json(['success' => true, 'data' => $productType], 201);
    }

    public function show(int $id): JsonResponse
    {
        $productType = $this->productTypeService->getProductTypeById($id);

        return response()->json(['success' => true, 'data' => $productType]);
    }

    public function update(UpdateProductTypeRequest $request, int $id): JsonResponse
    {
        $productType = $this->productTypeService->updateProductType($id, $request->validated());

        return response()->json(['success' => true, 'data' => $productType]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->productTypeService->deleteProductType($id);

        return response()->json(['success' => true]);
    }
}

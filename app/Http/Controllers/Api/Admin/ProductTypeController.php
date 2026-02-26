<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductTypeService;
use Illuminate\Http\JsonResponse;

class ProductTypeController extends Controller
{
    public function __construct(
        private readonly ProductTypeService $productTypeService
    ) {}

    public function index(): JsonResponse
    {
        $types = $this->productTypeService->getActiveProductTypes();

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSizeRequest;
use App\Http\Requests\UpdateSizeRequest;
use App\Services\SizeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    public function __construct(
        private readonly SizeService $sizeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $sizes = $this->sizeService->getPaginatedSizes($request->only(['search', 'sort_by', 'sort_dir']));

        return response()->json([
            'success' => true,
            'data' => $sizes
        ]);
    }

    public function store(StoreSizeRequest $request): JsonResponse
    {
        $size = $this->sizeService->createSize($request->validated());

        return response()->json(['success' => true, 'data' => $size]);
    }

    public function show($id): JsonResponse
    {
        $size = $this->sizeService->getSizeById($id);

        return response()->json(['success' => true, 'data' => $size]);
    }

    public function update(UpdateSizeRequest $request, $id): JsonResponse
    {
        $size = $this->sizeService->updateSize($id, $request->validated());

        return response()->json(['success' => true, 'data' => $size]);
    }

    public function destroy($id): JsonResponse
    {
        $this->sizeService->deleteSize($id);

        return response()->json(['success' => true, 'message' => 'Size deleted']);
    }
}

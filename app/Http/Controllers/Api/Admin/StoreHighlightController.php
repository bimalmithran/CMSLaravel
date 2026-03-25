<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStoreHighlightRequest;
use App\Http\Requests\UpdateStoreHighlightRequest;
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
        $highlights = $this->storeHighlightService->getPaginatedHighlights(
            $request->only(['search', 'sort_by', 'sort_dir'])
        );

        return response()->json([
            'success' => true,
            'data' => $highlights,
            'meta' => [
                'active_count' => $this->storeHighlightService->getActiveCount(),
                'max_active' => StoreHighlightService::MAX_ACTIVE,
            ],
        ]);
    }

    public function store(StoreStoreHighlightRequest $request): JsonResponse
    {
        $highlight = $this->storeHighlightService->create($request->validated());

        return response()->json(['success' => true, 'data' => $highlight], 201);
    }

    public function show(int $id): JsonResponse
    {
        $highlight = $this->storeHighlightService->getById($id);

        return response()->json(['success' => true, 'data' => $highlight]);
    }

    public function update(UpdateStoreHighlightRequest $request, int $id): JsonResponse
    {
        $highlight = $this->storeHighlightService->update($id, $request->validated());

        return response()->json(['success' => true, 'data' => $highlight]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->storeHighlightService->delete($id);

        return response()->json(['success' => true]);
    }
}

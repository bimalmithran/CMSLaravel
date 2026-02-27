<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContentBlockRequest;
use App\Http\Requests\UpdateContentBlockRequest;
use App\Services\ContentBlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentBlockController extends Controller
{
    public function __construct(
        private readonly ContentBlockService $contentBlockService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $blocks = $this->contentBlockService->getPaginatedBlocks(
            $request->only(['search', 'sort_by', 'sort_dir'])
        );

        return response()->json(['success' => true, 'data' => $blocks]);
    }

    public function store(StoreContentBlockRequest $request): JsonResponse
    {
        $block = $this->contentBlockService->create($request->validated());

        return response()->json(['success' => true, 'data' => $block], 201);
    }

    public function show(int $id): JsonResponse
    {
        $block = $this->contentBlockService->getById($id);

        return response()->json(['success' => true, 'data' => $block]);
    }

    public function update(UpdateContentBlockRequest $request, int $id): JsonResponse
    {
        $block = $this->contentBlockService->update($id, $request->validated());

        return response()->json(['success' => true, 'data' => $block]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->contentBlockService->delete($id);

        return response()->json(['success' => true]);
    }
}


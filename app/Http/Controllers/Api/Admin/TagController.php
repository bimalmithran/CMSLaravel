<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Services\TagService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function __construct(
        private readonly TagService $tagService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tags = $this->tagService->getPaginatedTags(
            $request->only(['search', 'sort_by', 'sort_dir']),
        );

        return response()->json(['success' => true, 'data' => $tags]);
    }

    public function list(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->tagService->getAllTagsList(),
        ]);
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = $this->tagService->createTag($request->validated());

        return response()->json(['success' => true, 'data' => $tag], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->tagService->getTagById($id),
        ]);
    }

    public function update(UpdateTagRequest $request, int $id): JsonResponse
    {
        $tag = $this->tagService->updateTag($id, $request->validated());

        return response()->json(['success' => true, 'data' => $tag]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->tagService->deleteTag($id);

        return response()->json(['success' => true, 'message' => 'Tag deleted']);
    }
}

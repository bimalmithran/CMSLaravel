<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaRequest;
use App\Http\Requests\UpdateMediaRequest;
use App\Http\Requests\BulkDeleteMediaRequest;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use \Illuminate\Http\Request;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaService $mediaService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $media = $this->mediaService->getPaginatedMedia(24, $request->query('search'));

        return response()->json([
            'success' => true,
            'data' => $media
        ]);
    }

    public function store(StoreMediaRequest $request): JsonResponse
    {
        $media = $this->mediaService->uploadMedia($request->file('file'));

        return response()->json([
            'success' => true,
            'data' => $media
        ]);
    }

    public function update(UpdateMediaRequest $request, int $id): JsonResponse
    {
        $media = $this->mediaService->updateMedia($id, $request->validated());

        return response()->json([
            'success' => true,
            'data' => $media,
            'message' => 'Media details updated successfully'
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->mediaService->deleteMedia($id);

        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    }

    public function bulkDestroy(BulkDeleteMediaRequest $request): JsonResponse
    {
        $this->mediaService->bulkDeleteMedia($request->validated('ids'));

        return response()->json([
            'success' => true,
            'message' => 'Selected files deleted successfully'
        ]);
    }
}

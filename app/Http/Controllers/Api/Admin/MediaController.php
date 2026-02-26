<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaRequest;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaService $mediaService
    ) {}

    public function index(): JsonResponse
    {
        $media = $this->mediaService->getPaginatedMedia();

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

    public function destroy(int $id): JsonResponse
    {
        $this->mediaService->deleteMedia($id);

        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ContentBlockService;
use Illuminate\Http\JsonResponse;

class ContentBlockController extends Controller
{
    public function __construct(
        private readonly ContentBlockService $contentBlockService
    ) {}

    public function showByIdentifier(string $identifier): JsonResponse
    {
        $block = $this->contentBlockService->getActiveBlockByIdentifier($identifier);

        if (! $block) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'data' => $block,
        ]);
    }
}


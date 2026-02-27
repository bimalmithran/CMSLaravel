<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PageService;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function __construct(
        private readonly PageService $pageService
    ) {}

    public function showBySlug(string $slug): JsonResponse
    {
        $page = $this->pageService->getActivePageBySlug($slug);

        return response()->json([
            'success' => true,
            'data' => $page,
        ]);
    }
}


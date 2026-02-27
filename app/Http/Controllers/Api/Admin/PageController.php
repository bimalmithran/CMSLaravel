<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePageRequest;
use App\Http\Requests\UpdatePageRequest;
use App\Services\PageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function __construct(
        private readonly PageService $pageService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $pages = $this->pageService->getPaginatedPages(
            $request->only(['search', 'sort_by', 'sort_dir'])
        );

        return response()->json(['success' => true, 'data' => $pages]);
    }

    public function store(StorePageRequest $request): JsonResponse
    {
        $page = $this->pageService->createPage($request->validated());

        return response()->json(['success' => true, 'data' => $page], 201);
    }

    public function show(int $id): JsonResponse
    {
        $page = $this->pageService->getPageById($id);

        return response()->json(['success' => true, 'data' => $page]);
    }

    public function update(UpdatePageRequest $request, int $id): JsonResponse
    {
        $page = $this->pageService->updatePage($id, $request->validated());

        return response()->json(['success' => true, 'data' => $page]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->pageService->deletePage($id);

        return response()->json(['success' => true]);
    }
}


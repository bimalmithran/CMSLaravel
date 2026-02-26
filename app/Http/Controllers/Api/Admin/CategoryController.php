<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $categories = $this->categoryService->getPaginatedCategories($request->only(['search', 'sort_by', 'sort_dir']));

        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function list(): JsonResponse
    {
        $categories = $this->categoryService->getAllCategoriesList();

        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory($request->validated());

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = $this->categoryService->getCategoryById($id);

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        $category = $this->categoryService->updateCategory($id, $request->validated());

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->categoryService->deleteCategory($id);

        return response()->json(['success' => true]);
    }
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;
use App\Services\MenuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function __construct(
        private readonly MenuService $menuService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $menus = $this->menuService->getPaginatedMenus($request->only(['search', 'sort_by', 'sort_dir']));

        return response()->json(['success' => true, 'data' => $menus]);
    }

    public function list(): JsonResponse
    {
        $menus = $this->menuService->getAllMenusList();

        return response()->json(['success' => true, 'data' => $menus]);
    }

    public function store(StoreMenuRequest $request): JsonResponse
    {
        $menu = $this->menuService->createMenu($request->validated());

        return response()->json(['success' => true, 'data' => $menu], 201);
    }

    public function show(int $id): JsonResponse
    {
        $menu = $this->menuService->getMenuById($id);

        return response()->json(['success' => true, 'data' => $menu]);
    }

    public function update(UpdateMenuRequest $request, int $id): JsonResponse
    {
        $menu = $this->menuService->updateMenu($id, $request->validated());

        return response()->json(['success' => true, 'data' => $menu]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->menuService->deleteMenu($id);

        return response()->json(['success' => true]);
    }
}

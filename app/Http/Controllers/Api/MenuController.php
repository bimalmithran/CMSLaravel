<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MenuService;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function __construct(
        private readonly MenuService $menuService
    ) {}

    public function index(): JsonResponse
    {
        $menus = $this->menuService->getActiveMenuTreeForStorefront();

        return response()->json([
            'success' => true,
            'data' => $menus,
        ]);
    }
}

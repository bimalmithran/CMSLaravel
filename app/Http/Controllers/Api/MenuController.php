<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
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
        $placement = $request->query('placement');

        $allowed = [Menu::PLACEMENT_HEADER, Menu::PLACEMENT_FOOTER];
        $resolvedPlacement = in_array($placement, $allowed, true) ? $placement : null;

        $menus = $this->menuService->getActiveMenuTreeForStorefront($resolvedPlacement);

        return response()->json([
            'success' => true,
            'data' => $menus,
        ]);
    }
}

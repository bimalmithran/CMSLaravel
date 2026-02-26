<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductType;

class ProductTypeController extends Controller
{
    public function index()
    {
        // Just return a flat, active list for the frontend dropdowns
        $types = ProductType::where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }
}

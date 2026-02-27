<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TestimonialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function __construct(
        private readonly TestimonialService $testimonialService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 20);
        $data = $this->testimonialService->getActiveForStorefront($limit);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}


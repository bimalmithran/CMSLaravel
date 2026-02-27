<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FaqService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function __construct(
        private readonly FaqService $faqService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $category = $request->string('category')->toString() ?: null;
        $faqs = $this->faqService->getActiveForStorefront($category);

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }
}


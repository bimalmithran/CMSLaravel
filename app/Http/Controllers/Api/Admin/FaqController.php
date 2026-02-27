<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFaqRequest;
use App\Http\Requests\UpdateFaqRequest;
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
        $faqs = $this->faqService->getPaginatedFaqs(
            $request->only(['search', 'sort_by', 'sort_dir'])
        );

        return response()->json(['success' => true, 'data' => $faqs]);
    }

    public function store(StoreFaqRequest $request): JsonResponse
    {
        $faq = $this->faqService->create($request->validated());

        return response()->json(['success' => true, 'data' => $faq], 201);
    }

    public function show(int $id): JsonResponse
    {
        $faq = $this->faqService->getById($id);

        return response()->json(['success' => true, 'data' => $faq]);
    }

    public function update(UpdateFaqRequest $request, int $id): JsonResponse
    {
        $faq = $this->faqService->update($id, $request->validated());

        return response()->json(['success' => true, 'data' => $faq]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->faqService->delete($id);

        return response()->json(['success' => true]);
    }
}


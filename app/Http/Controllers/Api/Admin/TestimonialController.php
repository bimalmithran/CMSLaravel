<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTestimonialRequest;
use App\Http\Requests\UpdateTestimonialRequest;
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
        $testimonials = $this->testimonialService->getPaginatedTestimonials(
            $request->only(['search', 'sort_by', 'sort_dir'])
        );

        return response()->json(['success' => true, 'data' => $testimonials]);
    }

    public function store(StoreTestimonialRequest $request): JsonResponse
    {
        $testimonial = $this->testimonialService->create($request->validated());

        return response()->json(['success' => true, 'data' => $testimonial], 201);
    }

    public function show(int $id): JsonResponse
    {
        $testimonial = $this->testimonialService->getById($id);

        return response()->json(['success' => true, 'data' => $testimonial]);
    }

    public function update(UpdateTestimonialRequest $request, int $id): JsonResponse
    {
        $testimonial = $this->testimonialService->update($id, $request->validated());

        return response()->json(['success' => true, 'data' => $testimonial]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->testimonialService->delete($id);

        return response()->json(['success' => true]);
    }
}


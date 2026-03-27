<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['customer:id,first_name,last_name,email', 'product:id,name'])
            ->latest();

        if ($request->filled('product_id')) {
            $query->where('product_id', (int) $request->input('product_id'));
        }

        if ($request->filled('approved')) {
            $query->where('is_approved', filter_var($request->input('approved'), FILTER_VALIDATE_BOOLEAN));
        }

        $reviews = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $reviews,
        ]);
    }

    public function updateApproval(Request $request, int $id): JsonResponse
    {
        $review = Review::findOrFail($id);

        $validated = $request->validate([
            'is_approved' => ['required', 'boolean'],
        ]);

        $review->update(['is_approved' => $validated['is_approved']]);

        return response()->json([
            'success' => true,
            'message' => $validated['is_approved'] ? 'Review approved.' : 'Review rejected.',
            'data'    => $review,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted.',
        ]);
    }
}

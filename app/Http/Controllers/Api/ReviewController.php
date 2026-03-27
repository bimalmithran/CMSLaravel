<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, int $productId): JsonResponse
    {
        $customer = auth('customer')->user();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to submit a review.',
            ], 401);
        }

        $product = Product::active()->find($productId);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        // Prevent duplicate reviews from the same customer
        $existing = Review::where('product_id', $productId)
            ->where('customer_id', $customer->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted a review for this product.',
            ], 422);
        }

        $validated = $request->validate([
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        Review::create([
            'product_id'  => $productId,
            'customer_id' => $customer->id,
            'rating'      => $validated['rating'],
            'comment'     => $validated['comment'] ?? null,
            'is_approved' => false, // Pending admin approval
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your review has been submitted and is pending approval.',
        ], 201);
    }
}

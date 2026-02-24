<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WishlistController extends Controller
{
    private function resolveSessionId(Request $request): string
    {
        $sessionId = $request->string('session_id')->toString();
        if ($sessionId !== '') {
            return $sessionId;
        }

        $customer = auth('customer')->user();
        if ($customer) {
            return "customer-{$customer->id}";
        }

        return (string) Str::uuid();
    }

    public function index(Request $request): JsonResponse
    {
        $sessionId = $this->resolveSessionId($request);

        $items = Wishlist::where('session_id', $sessionId)
            ->with('product')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'session_id' => $sessionId,
                'items' => $items,
            ],
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'string'],
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $sessionId = $this->resolveSessionId($request);
        $customer = auth('customer')->user();

        Wishlist::firstOrCreate([
            'session_id' => $sessionId,
            'product_id' => (int) $validated['product_id'],
        ], [
            'customer_id' => $customer?->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'session_id' => $sessionId,
            ],
        ], 201);
    }

    public function remove(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'string'],
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $sessionId = $this->resolveSessionId($request);

        Wishlist::where('session_id', $sessionId)
            ->where('product_id', (int) $validated['product_id'])
            ->delete();

        return response()->json([
            'success' => true,
            'data' => [
                'session_id' => $sessionId,
            ],
        ]);
    }
}


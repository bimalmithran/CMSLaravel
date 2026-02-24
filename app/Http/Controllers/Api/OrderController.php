<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    private function resolveCart(Request $request): ?Cart
    {
        $customer = auth('customer')->user();

        if ($customer) {
            return Cart::where('customer_id', $customer->id)->first();
        }

        $sessionId = $request->string('session_id')->toString();
        if ($sessionId === '') {
            return null;
        }

        return Cart::whereNull('customer_id')->where('session_id', $sessionId)->first();
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'string'],
            'customer_name' => ['required', 'string'],
            'customer_email' => ['required', 'email'],
            'customer_phone' => ['nullable', 'string'],
            'billing_address' => ['required', 'string'],
            'shipping_address' => ['required', 'string'],
            'payment_method' => ['nullable', 'in:card,bank_transfer,upi,cash_on_delivery'],
            'notes' => ['nullable', 'string'],
        ]);

        $cart = $this->resolveCart($request);
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart not found',
            ], 404);
        }

        $customer = auth('customer')->user();
        if ($customer) {
            $validated['customer_id'] = $customer->id;
        }

        try {
            $order = $this->orderService->createOrderFromCart($cart, $validated);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order created',
            'data' => $order,
        ], 201);
    }

    public function myOrders(Request $request): JsonResponse
    {
        $customer = $request->user('customer');
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $orders = Order::where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $customer = $request->user('customer');
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $order = Order::where('customer_id', $customer->id)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }
}


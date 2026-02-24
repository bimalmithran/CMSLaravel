<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::query();

        if ($request->filled('order_status')) {
            $query->where('order_status', $request->string('order_status')->toString());
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->string('payment_status')->toString());
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        $orders = $query->orderByDesc('id')->paginate(20);

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        return response()->json(['success' => true, 'data' => $order]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'order_status' => ['required', Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])],
        ]);

        $order->order_status = $validated['order_status'];

        if ($order->order_status === 'shipped' && !$order->shipped_at) {
            $order->shipped_at = now();
        }

        if ($order->order_status === 'delivered' && !$order->delivered_at) {
            $order->delivered_at = now();
        }

        $order->save();

        return response()->json(['success' => true, 'data' => $order->fresh()]);
    }

    public function updatePaymentStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'payment_status' => ['required', Rule::in(['pending', 'completed', 'failed', 'refunded'])],
        ]);

        $order->payment_status = $validated['payment_status'];

        if ($order->payment_status === 'completed' && !$order->paid_at) {
            $order->paid_at = now();
        }

        $order->save();

        return response()->json(['success' => true, 'data' => $order->fresh()]);
    }
}


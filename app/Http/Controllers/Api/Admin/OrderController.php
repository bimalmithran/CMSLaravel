<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrderPaymentStatusRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['order_status', 'payment_status', 'search']);
        $orders = $this->orderService->getPaginatedOrders($filters);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $order = $this->orderService->getOrderById($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, int $id): JsonResponse
    {
        $order = $this->orderService->updateOrderStatus($id, $request->validated('order_status'));

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    public function updatePaymentStatus(UpdateOrderPaymentStatusRequest $request, int $id): JsonResponse
    {
        $order = $this->orderService->updatePaymentStatus($id, $request->validated('payment_status'));

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }
}

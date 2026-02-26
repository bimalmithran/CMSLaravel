<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OrderService
{
    // =========================================================================
    // STOREFRONT / CHECKOUT LOGIC
    // =========================================================================

    public function createOrderFromCart(Cart $cart, array $data): Order
    {
        return DB::transaction(function () use ($cart, $data) {
            if (!$cart->items || count($cart->items) === 0) {
                throw new RuntimeException('Cart is empty');
            }

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'customer_id' => $data['customer_id'] ?? null,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'billing_address' => $data['billing_address'],
                'shipping_address' => $data['shipping_address'],
                'subtotal' => $cart->subtotal,
                'tax' => $cart->tax,
                'shipping' => $cart->shipping,
                'discount' => $cart->discount,
                'total' => $cart->total,
                'items' => array_values($cart->items),
                'payment_method' => $data['payment_method'] ?? 'cash_on_delivery',
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'notes' => $data['notes'] ?? null,
            ]);

            // Deduct stock for each product
            foreach ($cart->items as $item) {
                Product::findOrFail($item['product_id'])
                    ->decrement('stock', $item['quantity']);
            }

            // Clear the cart after successful order creation
            $cart->clear();
            $cart->save();

            return $order;
        });
    }

    // =========================================================================
    // ADMIN / MANAGEMENT LOGIC
    // =========================================================================

    public function getPaginatedOrders(array $filters): LengthAwarePaginator
    {
        $query = Order::query();

        if (!empty($filters['order_status'])) {
            $query->where('order_status', $filters['order_status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        return $query->orderByDesc('id')->paginate(20);
    }

    public function getOrderById(int $id): Order
    {
        return Order::findOrFail($id);
    }

    public function updateOrderStatus(int $id, string $status): Order
    {
        $order = $this->getOrderById($id);

        $order->order_status = $status;

        if ($status === 'shipped' && !$order->shipped_at) {
            $order->shipped_at = now();
        }

        if ($status === 'delivered' && !$order->delivered_at) {
            $order->delivered_at = now();
        }

        $order->save();

        return $order;
    }

    public function updatePaymentStatus(int $id, string $status): Order
    {
        $order = $this->getOrderById($id);

        $order->payment_status = $status;

        if ($status === 'completed' && !$order->paid_at) {
            $order->paid_at = now();
        }

        $order->save();

        return $order;
    }
}

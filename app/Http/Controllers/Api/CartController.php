<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService)
    {
    }

    private function getOrCreateCart(Request $request): Cart
    {
        $customer = auth('customer')->user();
        $sessionId = $request->string('session_id')->toString();

        if ($customer) {
            $customerCart = Cart::where('customer_id', $customer->id)->first();

            if (!$customerCart) {
                $customerCart = Cart::create([
                    'customer_id' => $customer->id,
                    'session_id' => $sessionId !== '' ? $sessionId : (string) Str::uuid(),
                    'items' => [],
                ]);
            }

            // Optional: merge guest cart into customer cart if provided
            if ($sessionId !== '') {
                $guestCart = Cart::whereNull('customer_id')->where('session_id', $sessionId)->first();
                if ($guestCart && $guestCart->items && count($guestCart->items) > 0) {
                    foreach ($guestCart->items as $item) {
                        $customerCart->addItem($item['product_id'], $item['quantity'], $item['price']);
                    }
                    $customerCart->calculateTotals();
                    $customerCart->save();
                    $guestCart->delete();
                }
            }

            return $customerCart;
        }

        if ($sessionId === '') {
            $sessionId = (string) Str::uuid();
        }

        $cart = Cart::where('session_id', $sessionId)->first();
        if (!$cart) {
            $cart = Cart::create([
                'session_id' => $sessionId,
                'items' => [],
            ]);
        }

        return $cart;
    }

    private function hydrateCartItems(Cart $cart): array
    {
        $items = array_values($cart->items ?? []);
        $productIds = array_values(array_unique(array_map(fn ($i) => (int) $i['product_id'], $items)));

        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        return array_map(function ($item) use ($products) {
            $product = $products->get((int) $item['product_id']);

            return [
                ...$item,
                'product' => $product,
                'line_total' => (float) $item['price'] * (int) $item['quantity'],
            ];
        }, $items);
    }

    public function index(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);

        return response()->json([
            'success' => true,
            'data' => [
                'cart' => $cart,
                'items' => $this->hydrateCartItems($cart),
            ],
        ]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'string'],
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->getOrCreateCart($request);

        try {
            $this->cartService->addItem($cart, (int) $validated['product_id'], (int) $validated['quantity']);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'data' => [
                'cart' => $cart->fresh(),
                'items' => $this->hydrateCartItems($cart),
            ],
        ]);
    }

    public function updateItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'string'],
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = $this->getOrCreateCart($request);

        try {
            $this->cartService->updateItemQuantity($cart, (int) $validated['product_id'], (int) $validated['quantity']);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart updated',
            'data' => [
                'cart' => $cart->fresh(),
                'items' => $this->hydrateCartItems($cart),
            ],
        ]);
    }

    public function removeItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'string'],
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $cart = $this->getOrCreateCart($request);
        $this->cartService->removeItem($cart, (int) $validated['product_id']);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
            'data' => [
                'cart' => $cart->fresh(),
                'items' => $this->hydrateCartItems($cart),
            ],
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request);
        $this->cartService->clearCart($cart);

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
            'data' => [
                'cart' => $cart->fresh(),
                'items' => [],
            ],
        ]);
    }

    public function applyDiscount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['nullable', 'string'],
            'discount' => ['required', 'numeric', 'min:0'],
        ]);

        $cart = $this->getOrCreateCart($request);
        $this->cartService->applyDiscount($cart, (float) $validated['discount']);

        return response()->json([
            'success' => true,
            'message' => 'Discount applied',
            'data' => [
                'cart' => $cart->fresh(),
                'items' => $this->hydrateCartItems($cart),
            ],
        ]);
    }
}


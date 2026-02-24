<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Product;

class CartService
{
    public function addItem(Cart $cart, int $productId, int $quantity): Cart
    {
        $product = Product::findOrFail($productId);

        if (!$product->isInStock() || $product->stock < $quantity) {
            throw new \RuntimeException('Insufficient stock');
        }

        $cart->addItem($productId, $quantity, $product->effective_price);
        $cart->calculateTotals();
        $cart->save();

        return $cart;
    }

    public function updateItemQuantity(Cart $cart, int $productId, int $quantity): Cart
    {
        $product = Product::findOrFail($productId);

        if ($product->stock < $quantity) {
            throw new \RuntimeException('Insufficient stock');
        }

        $cart->updateItemQuantity($productId, $quantity);
        $cart->calculateTotals();
        $cart->save();

        return $cart;
    }

    public function removeItem(Cart $cart, int $productId): Cart
    {
        $cart->removeItem($productId);
        $cart->calculateTotals();
        $cart->save();

        return $cart;
    }

    public function clearCart(Cart $cart): Cart
    {
        $cart->clear();
        $cart->save();

        return $cart;
    }

    public function applyDiscount(Cart $cart, float $discount): Cart
    {
        $cart->discount = min($discount, (float) $cart->subtotal);
        $cart->calculateTotals();
        $cart->save();

        return $cart;
    }
}


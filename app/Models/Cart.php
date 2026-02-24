<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'session_id',
        'customer_id',
        'items',
        'subtotal',
        'tax',
        'shipping',
        'discount',
        'total',
    ];

    protected $casts = [
        'items' => 'array',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function addItem($productId, $quantity, $price)
    {
        $items = $this->items ?? [];

        if (isset($items[$productId])) {
            $items[$productId]['quantity'] += $quantity;
        } else {
            $items[$productId] = [
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $price,
            ];
        }

        $this->items = $items;

        return $this;
    }

    public function removeItem($productId)
    {
        $items = $this->items ?? [];
        unset($items[$productId]);
        $this->items = $items;

        return $this;
    }

    public function updateItemQuantity($productId, $quantity)
    {
        $items = $this->items ?? [];
        if (isset($items[$productId])) {
            $items[$productId]['quantity'] = $quantity;
        }
        $this->items = $items;

        return $this;
    }

    public function clear()
    {
        $this->items = [];
        $this->subtotal = 0;
        $this->tax = 0;
        $this->shipping = 0;
        $this->discount = 0;
        $this->total = 0;

        return $this;
    }

    public function calculateTotals()
    {
        $subtotal = 0;
        foreach ($this->items ?? [] as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }

        $tax = $subtotal * 0.18;

        $this->subtotal = $subtotal;
        $this->tax = $tax;
        $this->total = $subtotal + $tax + $this->shipping - $this->discount;

        return $this;
    }
}


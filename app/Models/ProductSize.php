<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

// Extending Pivot instead of Model gives it extra built-in functionality for intermediate tables
class ProductSize extends Pivot
{
    // Explicitly define the table name since it breaks standard pluralization rules
    protected $table = 'product_size'; 
    
    // We want the ID to auto-increment for this pivot to make direct updates easier
    public $incrementing = true; 

    protected $fillable = [
        'product_id',
        'size_id',
        'stock',
        'weight_adjustment',
        'price_adjustment',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function size()
    {
        return $this->belongsTo(Size::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WatchSpec extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'movement_type',
        'dial_color',
        'strap_material',
        'glass_material',
        'water_resistance',
        'case_size',
        'warranty_period',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JewelrySpec extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'huid',
        'metal_type',
        'metal_color',
        'purity',
        'gender',
        'gross_weight',
        'net_weight',
        'stone_weight',
        'making_charge',
        'making_charge_type',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

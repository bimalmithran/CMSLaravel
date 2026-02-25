<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiamondSpec extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'diamond_clarity',
        'diamond_color',
        'diamond_cut',
        'diamond_setting',
        'diamond_count',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

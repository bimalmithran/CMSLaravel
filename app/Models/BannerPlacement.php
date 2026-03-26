<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BannerPlacement extends Model
{
    protected $fillable = [
        'key',
        'label',
        'description',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}

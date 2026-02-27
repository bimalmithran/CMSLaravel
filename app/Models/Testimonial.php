<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'customer_name',
        'designation_or_location',
        'content',
        'rating',
        'image_path',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];
}


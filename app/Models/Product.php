<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand_id',
        'product_type_id',
        'name',
        'slug',
        'sku',
        'short_description',
        'description',
        'price',
        'discount_price',
        'stock',
        'image',
        'gallery',
        'meta_title',
        'meta_description',
        'is_featured',
        'is_active',
        // Note: views, rating_avg, rating_count are typically updated via code, not mass assignment
    ];

    protected $casts = [
        'price' => 'float',
        'discount_price' => 'float',
        'gallery' => 'array', // Automatically handles JSON conversion
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    // --- Core Relationships ---

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    // --- Subtype (Class Table Inheritance) Relationships ---

    public function jewelrySpec(): HasOne
    {
        return $this->hasOne(JewelrySpec::class);
    }

    public function watchSpec(): HasOne
    {
        return $this->hasOne(WatchSpec::class);
    }

    public function diamondSpec(): HasOne
    {
        return $this->hasOne(DiamondSpec::class);
    }

    // --- Extensions ---

    public function sizes(): BelongsToMany
    {
        return $this->belongsToMany(Size::class, 'product_sizes')
            ->withPivot(['id', 'stock', 'weight_adjustment', 'price_adjustment'])
            ->withTimestamps();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}

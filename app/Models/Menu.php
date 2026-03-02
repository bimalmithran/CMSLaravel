<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Menu extends Model
{
    public const TYPE_LINK = 'link';
    public const TYPE_DROPDOWN = 'dropdown';
    public const TYPE_PRODUCT_LISTING = 'product_listing';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'menu_type',
        'page_id',
        'is_active',
        'position',
        'parent_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public static function types(): array
    {
        return [
            self::TYPE_LINK,
            self::TYPE_DROPDOWN,
            self::TYPE_PRODUCT_LISTING,
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id');
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function childrenRecursive(): HasMany
    {
        return $this->children()->with(['childrenRecursive', 'page']);
    }

    public static function generateSlug(string $name): string
    {
        return Str::slug($name);
    }
}

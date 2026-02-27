<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'media_id',
        'type',
        'group',
    ];

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = [
        'disk',
        'file_name',
        'path',
        'mime_type',
        'size',
        'alt_text'
    ];
}

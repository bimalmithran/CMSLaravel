<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|unique:menus,name',
            'slug' => ['nullable', 'string', 'max:255', 'unique:menus,slug'],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'position' => 'integer',
            'parent_id' => 'nullable|exists:menus,id',
        ];
    }
}

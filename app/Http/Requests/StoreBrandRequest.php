<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Assuming admin middleware handles auth
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:brands,name',
            'logo' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ];
    }
}
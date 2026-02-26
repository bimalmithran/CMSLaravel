<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // $this->brand is the ID passed in the route: /api/v1/admin/brands/{brand}
        return [
            'name' => 'required|string|max:255|unique:brands,name,' . $this->brand,
            'logo' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ];
    }
}

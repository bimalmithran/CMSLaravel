<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Get the ID from the route parameter (usually 'menu' or 'id')
        $id = $this->route('menu') ?? $this->route('id');

        return [
            'name' => 'required|string|unique:menus,name,' . $id,
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('menus', 'slug')->ignore($id)],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'position' => 'integer',
            'parent_id' => 'nullable|exists:menus,id',
        ];
    }
}

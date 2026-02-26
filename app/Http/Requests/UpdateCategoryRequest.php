<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Get the ID from the route parameter (usually 'category' or 'id')
        $id = $this->route('category') ?? $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($id)],
            'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($id)],
            'description' => ['sometimes', 'nullable', 'string'],
            'order' => ['sometimes', 'nullable', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
            'image' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}

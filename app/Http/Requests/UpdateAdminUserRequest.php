<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Retrieve the ID from the route. Adjust 'id' to 'admin_user' if your route is defined differently.
        $id = $this->route('id') ?? $this->route('admin_user');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('admin_users', 'email')->ignore($id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'role' => ['sometimes', Rule::in(['super_admin', 'admin', 'moderator', 'staff'])],
            'permissions' => ['sometimes', 'nullable', 'array'],
            'permissions.*' => ['string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

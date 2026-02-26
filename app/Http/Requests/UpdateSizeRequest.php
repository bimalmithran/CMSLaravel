<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSizeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // $this->size retrieves the ID from the route /api/v1/admin/sizes/{size}
        return [
            'name' => 'required|string|max:255|unique:sizes,name,' . $this->size,
            'type' => 'required|string|max:50',
        ];
    }
}

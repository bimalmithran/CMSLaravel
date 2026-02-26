<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSizeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:sizes,name',
            'type' => 'required|string|max:50', // e.g., 'ring', 'bangle', 'chain'
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file_name' => ['nullable', 'string', 'max:255'],
            'alt_text'  => ['nullable', 'string', 'max:255'],
        ];
    }
}

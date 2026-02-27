<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreContentBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'identifier' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:_[a-z0-9]+)*$/', Rule::unique('content_blocks', 'identifier')],
            'type' => ['required', Rule::in(['text', 'html', 'image', 'json'])],
            'content' => ['nullable'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $type = $this->input('type');
            $content = $this->input('content');

            $this->validateContentByType($validator, $type, $content);
        });
    }

    private function validateContentByType(Validator $validator, ?string $type, mixed $content): void
    {
        if (! in_array($type, ['text', 'html', 'image', 'json'], true)) {
            return;
        }

        if ($type === 'json') {
            if ($content === null || $content === '') {
                return;
            }
            if (! is_string($content)) {
                $validator->errors()->add('content', 'JSON content must be a stringified JSON value.');
                return;
            }
            json_decode($content);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $validator->errors()->add('content', 'Content must be valid JSON.');
            }
            return;
        }

        if (! is_null($content) && ! is_string($content)) {
            $validator->errors()->add('content', 'Content must be a string.');
            return;
        }

        if ($type === 'image' && ! is_null($content) && strlen($content) > 2048) {
            $validator->errors()->add('content', 'Image path is too long.');
        }
    }
}


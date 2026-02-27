<?php

namespace App\Http\Requests;

use App\Models\ContentBlock;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateContentBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('content_block');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'identifier' => ['sometimes', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:_[a-z0-9]+)*$/', Rule::unique('content_blocks', 'identifier')->ignore($id)],
            'type' => ['sometimes', Rule::in(['text', 'html', 'image', 'json'])],
            'content' => ['sometimes', 'nullable'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $id = (int) ($this->route('id') ?? 0);
            $block = ContentBlock::find($id);
            $type = $this->input('type', $block?->type);

            if (! is_string($type)) {
                return;
            }

            if (! $this->has('content')) {
                return;
            }

            $this->validateContentByType($validator, $type, $this->input('content'));
        });
    }

    private function validateContentByType(Validator $validator, string $type, mixed $content): void
    {
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


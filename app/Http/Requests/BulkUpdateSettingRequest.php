<?php

namespace App\Http\Requests;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class BulkUpdateSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('admin-api') !== null;
    }

    public function rules(): array
    {
        return [
            'settings' => ['required', 'array', 'min:1'],
            'settings.*.id' => ['required', 'integer', 'exists:settings,id'],
            'settings.*.value' => ['nullable'],
            'settings.*.media_id' => ['nullable', 'integer', 'exists:media,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var array<int, array{id:int, value:mixed, media_id?:int|null}> $payload */
            $payload = $this->input('settings', []);

            if (! is_array($payload) || $payload === []) {
                return;
            }

            $settingTypes = Setting::query()
                ->whereIn('id', collect($payload)->pluck('id'))
                ->get(['id', 'type'])
                ->keyBy('id');

            foreach ($payload as $index => $item) {
                if (! is_array($item) || ! array_key_exists('id', $item)) {
                    continue;
                }

                $setting = $settingTypes->get($item['id']);
                if (! $setting) {
                    continue;
                }

                $this->validateByType(
                    $validator,
                    $setting->type,
                    $item,
                    "settings.$index"
                );
            }
        });
    }

    /**
     * @param array{id:int, value:mixed, media_id?:int|null} $item
     */
    private function validateByType(
        Validator $validator,
        string $type,
        array $item,
        string $basePath
    ): void {
        $value = $item['value'] ?? null;
        $mediaId = $item['media_id'] ?? null;

        if ($mediaId !== null && $type !== 'image') {
            $validator->errors()->add("$basePath.media_id", 'Only image settings can reference media.');
            return;
        }

        switch ($type) {
            case 'image':
            case 'text':
            case 'textarea':
                if (! is_null($value) && ! is_string($value)) {
                    $validator->errors()->add("$basePath.value", "The value must be a string or null for {$type} settings.");
                }
                break;

            case 'boolean':
                if (
                    ! is_null($value)
                    && ! is_bool($value)
                    && ! in_array($value, [0, 1, '0', '1', 'true', 'false'], true)
                ) {
                    $validator->errors()->add("$basePath.value", 'The value must be boolean-compatible.');
                }
                break;

            case 'number':
                if (! is_null($value) && ! is_numeric($value)) {
                    $validator->errors()->add("$basePath.value", 'The value must be numeric.');
                }
                break;

            case 'json':
                if (is_null($value)) {
                    break;
                }

                if (is_array($value)) {
                    break;
                }

                if (! is_string($value)) {
                    $validator->errors()->add("$basePath.value", 'The value must be valid JSON.');
                    break;
                }

                json_decode($value);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $validator->errors()->add("$basePath.value", 'The value must be valid JSON.');
                }
                break;

            default:
                if (! is_null($value) && ! is_string($value)) {
                    $validator->errors()->add("$basePath.value", "The value must be a string or null for {$type} settings.");
                }
                break;
        }
    }
}

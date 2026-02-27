<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    private const ADMIN_CACHE_KEY = 'global_settings_admin';
    private const PUBLIC_CACHE_KEY = 'global_settings_kv';

    public function getAllSettings(): Collection
    {
        return Cache::rememberForever(self::ADMIN_CACHE_KEY, function () {
            return Setting::query()
                ->orderBy('group')
                ->orderBy('key')
                ->get();
        });
    }

    public function getPublicKeyValueSettings(): array
    {
        return Cache::rememberForever(self::PUBLIC_CACHE_KEY, function (): array {
            return Setting::query()
                ->orderBy('group')
                ->orderBy('key')
                ->get(['key', 'value', 'type'])
                ->mapWithKeys(fn (Setting $setting): array => [
                    $setting->key => $this->castPublicValue($setting->value, $setting->type),
                ])
                ->all();
        });
    }

    public function bulkUpdateSettings(array $settingsData): void
    {
        DB::transaction(function () use ($settingsData): void {
            $settings = Setting::query()
                ->whereIn('id', collect($settingsData)->pluck('id'))
                ->get()
                ->keyBy('id');

            $mediaIds = collect($settingsData)
                ->pluck('media_id')
                ->filter(fn ($id) => is_int($id) || ctype_digit((string) $id))
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values();

            $mediaById = Media::query()
                ->when(
                    $mediaIds->isNotEmpty(),
                    fn (Builder $query) => $query->whereIn('id', $mediaIds),
                    fn (Builder $query) => $query->whereRaw('1 = 0')
                )
                ->get(['id', 'path'])
                ->keyBy('id');

            foreach ($settingsData as $data) {
                $setting = $settings->get($data['id']);
                if (! $setting) {
                    continue;
                }

                $normalizedValue = $this->normalizeValue($setting->type, $data['value'] ?? null);
                $payload = ['value' => $normalizedValue];

                if ($setting->type === 'image') {
                    $mediaId = isset($data['media_id']) ? (int) $data['media_id'] : null;
                    $payload['media_id'] = $mediaId;
                    $payload['value'] = $mediaId ? ($mediaById->get($mediaId)?->path ?? null) : $normalizedValue;
                } else {
                    $payload['media_id'] = null;
                }

                $setting->update($payload);
            }
        });

        Cache::forget(self::ADMIN_CACHE_KEY);
        Cache::forget(self::PUBLIC_CACHE_KEY);
    }

    private function normalizeValue(string $type, mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ? '1' : '0',
            'number' => (string) $value,
            'json' => is_string($value) ? $value : (json_encode($value) ?: null),
            default => is_string($value) ? $value : (string) $value,
        };
    }

    private function castPublicValue(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => $value === '1',
            'number' => is_numeric($value) ? (str_contains($value, '.') ? (float) $value : (int) $value) : $value,
            'json' => json_decode($value, true) ?? $value,
            default => $value,
        };
    }
}

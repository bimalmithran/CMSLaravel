<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use App\Jobs\OptimizeMediaJob;

class MediaService
{
    public function getPaginatedMedia(int $perPage = 24, array $filters = []): LengthAwarePaginator
    {
        $query = Media::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhere('alt_text', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type'])) {
            if ($filters['type'] === 'image') {
                $query->where('mime_type', 'like', 'image/%');
            } elseif ($filters['type'] === 'document') {
                $query->where('mime_type', 'not like', 'image/%');
            }
        }

        if (!empty($filters['collection_name'])) {
            $query->where('collection_name', $filters['collection_name']);
        }

        if (!empty($filters['date'])) {
            $date = $filters['date'];
            if ($date === 'today') {
                $query->whereDate('created_at', today());
            } elseif ($date === 'last_7_days') {
                $query->where('created_at', '>=', now()->subDays(7));
            } elseif ($date === 'this_month') {
                $query->whereMonth('created_at', now()->month)
                      ->whereYear('created_at', now()->year);
            }
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        
        $allowedSorts = ['created_at', 'size', 'file_name'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }

    public function uploadMedia(UploadedFile $file): Media
    {
        // 1. Store the original physical file immediately for a fast user response
        $path = $file->store('uploads', 'public');

        // 2. Create the database record
        $media = Media::create([
            'file_name' => $file->getClientOriginalName(),
            'path' => '/storage/' . ltrim($path, '/'),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        // 3. If it is an image, dispatch our background job!
        if (str_starts_with($media->mime_type, 'image/')) {
            OptimizeMediaJob::dispatch($media->id);
        }

        return $media;
    }

    public function updateMedia(int $id, array $data): Media
    {
        $media = Media::findOrFail($id);

        $updateData = [
            'file_name' => $data['file_name'] ?? $media->file_name,
            'alt_text' => $data['alt_text'] ?? $media->alt_text,
        ];

        if (array_key_exists('collection_name', $data)) {
            $updateData['collection_name'] = $data['collection_name'];
        }

        $media->update($updateData);

        return $media;
    }

    public function deleteMedia(int $id): void
    {
        // findOrFail automatically throws a 404 exception if the ID is missing
        $media = Media::findOrFail($id);

        // Clean the path and delete the physical file from storage
        $relativePath = str_replace('/storage/', '', $media->path);

        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }

        // Delete the database record
        $media->delete();
    }

    public function bulkDeleteMedia(array $ids): void
    {
        $mediaItems = Media::whereIn('id', $ids)->get();

        foreach ($mediaItems as $media) {
            $relativePath = str_replace('/storage/', '', $media->path);

            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }

            $media->delete();
        }
    }
}

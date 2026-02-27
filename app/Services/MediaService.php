<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use App\Jobs\OptimizeMediaJob;

class MediaService
{
    public function getPaginatedMedia(int $perPage = 24, ?string $search = null): LengthAwarePaginator
    {
        $query = Media::query();

        if ($search) {
            $query->where('file_name', 'like', "%{$search}%")
                ->orWhere('alt_text', 'like', "%{$search}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function uploadMedia(UploadedFile $file): Media
    {
        // 1. Store the original physical file immediately for a fast user response
        $path = $file->store('uploads', 'public');

        // 2. Create the database record
        $media = Media::create([
            'file_name' => $file->getClientOriginalName(),
            'path' => Storage::url($path),
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

        // Only allow updating safe text fields
        $media->update([
            'file_name' => $data['file_name'] ?? $media->file_name,
            'alt_text' => $data['alt_text'] ?? $media->alt_text,
        ]);

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

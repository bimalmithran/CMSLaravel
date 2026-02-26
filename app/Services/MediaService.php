<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class MediaService
{
    public function getPaginatedMedia(int $perPage = 24): LengthAwarePaginator
    {
        return Media::orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function uploadMedia(UploadedFile $file): Media
    {
        // Store the physical file
        $path = $file->store('uploads', 'public');

        // Create the database record
        return Media::create([
            'file_name' => $file->getClientOriginalName(),
            'path' => Storage::url($path),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
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
}

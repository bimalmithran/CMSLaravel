<?php

namespace App\Jobs;

use App\Models\Media;
use App\Contracts\ImageOptimizerInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class OptimizeMediaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private readonly int $mediaId) {}

    public function handle(ImageOptimizerInterface $optimizer): void
    {
        $media = Media::find($this->mediaId);
        
        // Safety check: ensure it exists and is actually an image
        if (!$media || !str_starts_with($media->mime_type, 'image/')) {
            return;
        }

        // Get the absolute path on the server
        $relativePath = str_replace('/storage/', '', $media->path);
        $absolutePath = Storage::disk('public')->path($relativePath);

        if (!file_exists($absolutePath)) {
            Log::warning("OptimizeMediaJob: File not found at {$absolutePath}");
            return;
        }

        try {
            // Delegate to our SOLID optimizer
            $result = $optimizer->optimize($absolutePath);

            // Calculate the new relative path for Storage URL generation
            $newRelativePath = str_replace(Storage::disk('public')->path(''), '', $result['path']);
            $newRelativePath = ltrim($newRelativePath, '/');

            $oldStorageUrl = $media->path;
            $newStorageUrl = '/storage/' . ltrim($newRelativePath, '/');

            // Update the database with the new WebP details
            $media->update([
                'path' => $newStorageUrl,
                'size' => $result['size'],
                'mime_type' => $result['mime_type'],
                // Update the display name to show it's a webp now
                'file_name' => preg_replace('/\.[^.]+$/', '.webp', $media->file_name)
            ]);

            // Cascade the path change to every table that may store a raw image URL,
            // so modules that already referenced the old path are not left broken.
            if ($oldStorageUrl !== $newStorageUrl) {
                DB::table('banners')->where('image_path', $oldStorageUrl)->update(['image_path' => $newStorageUrl]);
                DB::table('testimonials')->where('image_path', $oldStorageUrl)->update(['image_path' => $newStorageUrl]);
                DB::table('brands')->where('logo', $oldStorageUrl)->update(['logo' => $newStorageUrl]);
                DB::table('store_highlights')->where('icon', $oldStorageUrl)->update(['icon' => $newStorageUrl]);
                DB::table('products')->where('image', $oldStorageUrl)->update(['image' => $newStorageUrl]);
                DB::table('categories')->where('image', $oldStorageUrl)->update(['image' => $newStorageUrl]);
            }

            // Delete the original, heavy file to free up server space
            if ($absolutePath !== $result['path']) {
                @unlink($absolutePath);
            }
        } catch (\Exception $e) {
            Log::error("Failed to optimize image ID {$this->mediaId}: " . $e->getMessage());
            // We don't throw here, so the original image remains intact if compression fails
        }
    }
}
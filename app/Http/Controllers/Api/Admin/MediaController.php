<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Media;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index()
    {
        // Fetch all media, newest first
        $media = Media::orderBy('created_at', 'desc')->paginate(24);

        return response()->json([
            'success' => true,
            'data' => $media
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['file' => 'required|file|max:5120']); // 5MB limit

        $file = $request->file('file');
        $path = $file->store('uploads', 'public');

        $media = Media::create([
            'file_name' => $file->getClientOriginalName(),
            'path' => Storage::url($path),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return response()->json(['success' => true, 'data' => $media]);
    }

    public function destroy($id)
    {
        $media = Media::find($id);

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        // Delete the physical file from storage
        // Assuming your path looks like "/storage/uploads/..." we need to clean it to delete
        $relativePath = str_replace('/storage/', '', $media->path);
        Storage::disk('public')->delete($relativePath);

        // Delete the database record
        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    }
}

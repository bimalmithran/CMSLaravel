<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function index(): JsonResponse
    {
        $inquiries = ContactInquiry::latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $inquiries,
        ]);
    }

    public function markRead(int $id): JsonResponse
    {
        $inquiry = ContactInquiry::findOrFail($id);
        $inquiry->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function destroy(int $id): JsonResponse
    {
        ContactInquiry::findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }
}

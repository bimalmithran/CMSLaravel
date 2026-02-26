<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    public function index(Request $request)
    {
        $query = Size::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('type', 'like', '%' . $request->search . '%');
        }

        if ($request->has('sort_by') && $request->has('sort_dir')) {
            $query->orderBy($request->sort_by, $request->sort_dir);
        } else {
            $query->orderBy('type', 'asc')->orderBy('name', 'asc');
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(10)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sizes,name',
            'type' => 'required|string|max:50', // e.g., 'ring', 'bangle', 'chain'
        ]);

        $size = Size::create($validated);

        return response()->json(['success' => true, 'data' => $size]);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => Size::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $size = Size::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sizes,name,' . $size->id,
            'type' => 'required|string|max:50',
        ]);

        $size->update($validated);

        return response()->json(['success' => true, 'data' => $size]);
    }

    public function destroy($id)
    {
        Size::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Size deleted']);
    }
}

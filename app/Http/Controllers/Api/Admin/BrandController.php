<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('sort_by') && $request->has('sort_dir')) {
            $query->orderBy($request->sort_by, $request->sort_dir);
        } else {
            $query->orderBy('name', 'asc');
        }

        // Return paginated for the DataTable
        return response()->json([
            'success' => true,
            'data' => $query->paginate(10)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
            'logo' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $brand = Brand::create($validated);

        return response()->json(['success' => true, 'data' => $brand]);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => Brand::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name,' . $brand->id,
            'logo' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $brand->update($validated);

        return response()->json(['success' => true, 'data' => $brand]);
    }

    public function destroy($id)
    {
        Brand::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Brand deleted']);
    }
}

<?php

namespace App\Http\Requests;

use App\Models\Menu;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('menu') ?? $this->route('id');

        return [
            'name' => 'required|string|unique:menus,name,' . $id,
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('menus', 'slug')->ignore($id)],
            'description' => 'nullable|string',
            'menu_type' => ['required', Rule::in(Menu::types())],
            'page_id' => ['nullable', 'integer', 'exists:pages,id', Rule::unique('menus', 'page_id')->ignore($id)],
            'is_active' => 'boolean',
            'position' => 'integer',
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('menus', 'id')->where('menu_type', Menu::TYPE_DROPDOWN),
                Rule::notIn([(int) $id]),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $menuType = $this->input('menu_type');
            $pageId = $this->input('page_id');

            if ($menuType === Menu::TYPE_LINK && empty($pageId)) {
                $validator->errors()->add('page_id', 'A page is required for link menus.');
            }

            if ($menuType !== Menu::TYPE_LINK && ! empty($pageId)) {
                $validator->errors()->add('page_id', 'Only link menus can be associated with a page.');
            }
        });
    }
}

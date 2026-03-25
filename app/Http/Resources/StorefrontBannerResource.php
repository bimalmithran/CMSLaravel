<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StorefrontBannerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'price_text' => $this->price_text,
            'button_text' => $this->button_text,
            'action_url' => $this->action_url,
            'placement' => $this->placement,
            'image_url' => $this->image_path ? asset($this->image_path) : null,
        ];
    }
}

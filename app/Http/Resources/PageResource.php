<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/** @mixin \App\Models\Page */
class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'created_at' => (new Carbon($this->created_at))->format('Y-m-d H:i:s'),
            'updated_at' => (new Carbon($this->updated_at))->format('Y-m-d H:i:s'),
            'id' => $this->id,
            'name' => $this->name,
            'content' => $this->content,

            // expose slug and options (map custom_css from options if present)
            'slug' => $this->slug,
            'options' => $this->options ?? [],
            'custom_css' => is_array($this->options) && array_key_exists('custom_css', $this->options) ? $this->options['custom_css'] : null,

            'site_id' => $this->site_id,
            'user_id' => $this->user_id,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Flow */
class FlowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'created_at' => (new \Illuminate\Support\Carbon($this->created_at))->format('Y-m-d H:i:s'),
            'updated_at' => (new Carbon($this->updated_at))->format('Y-m-d H:i:s'),

            'id' => $this->id,
            'name' => $this->name,
            'sequence' => $this->sequence,

            'instance_id' => $this->instance_id,
        ];
    }
}

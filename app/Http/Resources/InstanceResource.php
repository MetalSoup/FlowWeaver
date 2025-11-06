<?php

namespace App\Http\Resources;

use App\Models\Instance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Instance */
class InstanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'organization_id' => $this->organization_id,
            'status' => $this->status,
            'created_at' => $this->created_at ? (new Carbon($this->created_at))->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->updated_at ? (new Carbon($this->updated_at))->format('Y-m-d H:i:s') : null,
        ];
    }
}


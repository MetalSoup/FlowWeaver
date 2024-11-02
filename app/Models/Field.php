<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Field extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'label',
        'instance_id',
        'type',
        'options',
    ];

    protected $casts = [
        'options' => 'collection',
    ];

    public function instance() : BelongsTo
    {
        return $this->belongsTo(Instance::class);
    }

}

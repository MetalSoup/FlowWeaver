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
        'site_id',
        'type',
        'options',
        'description'
    ];

    protected $casts = [
        'options' => 'collection',
    ];

    public function site() : BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

}

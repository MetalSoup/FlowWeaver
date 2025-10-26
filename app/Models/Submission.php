<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;

    // Allow mass assignment for these columns
    protected $fillable = [
        'flow_id',
        'step',
        'email',
        'phone',
        'data',
    ];

    // Cast data column to array (JSON)
    protected $casts = [
        'data' => 'array',
        'email' => 'string',
        'phone' => 'string',
    ];
}

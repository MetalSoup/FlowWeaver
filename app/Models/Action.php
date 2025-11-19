<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    use HasFactory;

    protected $table = 'actions';

    protected $fillable = [
        'submission_id',
        'email',
        'flow_id',
        'node_id',
        'event',
        'request_body',
        'request_headers',
        'response_body',
        'response_headers',
        'sent_values',
        'meta',
    ];

    protected $casts = [
        'request_headers' => 'array',
        'response_headers' => 'array',
        'sent_values' => 'array',
        'meta' => 'array',
    ];

    /**
     * Provide a model factory instance for HasFactory.
     */
    protected static function newFactory()
    {
        return \Database\Factories\ActionFactory::new();
    }
}

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
        'contact_id',
    ];

    // Cast data column to array (JSON)
    protected $casts = [
        'data' => 'array',
        'email' => 'string',
        'phone' => 'string',
    ];

    /**
     * Submission belongs to an optional Contact
     */
    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * Return normalized email or null
     */
    public function normalizedEmail(): ?string
    {
        if (empty($this->email)) {
            return null;
        }

        return strtolower(trim($this->email));
    }

    /**
     * Return normalized phone or null
     */
    public function normalizedPhone(): ?string
    {
        if (empty($this->phone)) {
            return null;
        }

        return trim($this->phone);
    }
}

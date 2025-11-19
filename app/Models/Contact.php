<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    // Allow mass assignment for common contact columns (match DefaultFields names)
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'street',
        'city',
        'state',
        'zip',
        'country',
        'company',
        'title',
        'website',
        'dob',
        'custom_fields',
        'status',
        'source',
        'site_id',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'dob' => 'date',
        'email' => 'string',
        'phone' => 'string',
    ];

    // Relationship: a contact can have many submissions
    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    /**
     * Update the contact with data from a submission.
     * Merge strategy: prefer non-empty submission values and fill blanks on contact.
     * Also merge submission->data into custom_fields, preserving existing keys.
     *
     * @param array $attributes  // expected keys: email, phone, data (array), first_name, last_name, site_id, source
     */
    public function updateFromSubmission(array $attributes): void
    {
        // Normalize email if present
        if (!empty($attributes['email'])) {
            $this->email = strtolower(trim($attributes['email']));
        }

        // Basic scalar fields: update when submission provides a non-empty value
        $fields = [
            'first_name', 'last_name', 'phone', 'address', 'street',
            'city', 'state', 'zip', 'country', 'company', 'title', 'website', 'dob', 'source', 'site_id',
        ];

        foreach ($fields as $f) {
            if (array_key_exists($f, $attributes) && !empty($attributes[$f])) {
                $this->{$f} = $attributes[$f];
            }
        }

        // Merge custom fields: submission data may contain arbitrary keys
        $existing = $this->custom_fields ?? [];
        $incoming = $attributes['data'] ?? [];

        if (is_array($incoming)) {
            // Prefer incoming non-empty values; preserve existing otherwise
            foreach ($incoming as $k => $v) {
                if ($v === null || $v === '') {
                    continue;
                }
                $existing[$k] = $v;
            }
            $this->custom_fields = $existing;
        }

        // Only save caller should persist; this helper just mutates the model
    }
}

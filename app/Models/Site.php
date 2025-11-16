<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Site extends Model
{
    use HasFactory;

    // Allow mass assignment for these fields when creating/updating via controller
    protected $fillable = [
        'name',
        'description',
        'organization_id',
        'status',
    ];

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'site_id');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(Field::class, 'site_id');
    }

    public function flows(): HasMany
    {
        return $this->hasMany(Flow::class, 'site_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');

    }


}

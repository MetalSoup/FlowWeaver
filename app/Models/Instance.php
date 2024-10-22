<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Instance extends Model
{
    use HasFactory;

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'instance_id');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(Field::class, 'instance_id');
    }

    public function flows(): HasMany
    {
        return $this->hasMany(Flow::class, 'instance_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}

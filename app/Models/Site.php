<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\SiteDomain;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media as MediaModel;
use Spatie\Image\Manipulations;

class Site extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

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

    public function registerMediaCollections(): void
    {
        $disk = config('medialibrary.disk_name', config('filesystems.default', 'public'));

        $this->addMediaCollection('images')
            ->useDisk($disk);

        $this->addMediaCollection('files')
            ->useDisk($disk);
    }

    public function registerMediaConversions(MediaModel $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(200)
            ->sharpen(10)
            ->performOnCollections('images');
    }

    /**
     * Domains associated with this Site (per-domain settings like default/404 pages)
     */
    public function domains(): HasMany
    {
        return $this->hasMany(SiteDomain::class, 'site_id');
    }

}

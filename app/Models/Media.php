<?php
// ...existing code...

namespace App\Models;

use App\Helpers\SiteContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media as SpatieMedia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SiteMediaScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        $siteId = self::resolveSiteId();
        if ($siteId) {
            $builder->where('site_id', $siteId);
        }
    }

    public static function resolveSiteId(): ?int
    {
        // Prefer SiteContext (used by jobs/console)
        $siteId = SiteContext::get();
        if ($siteId) return $siteId;

        // Prefer authenticated user's selectedSite if available
        try {
            $user = Auth::user();
            if ($user && method_exists($user, 'selectedSite') && $user->selectedSite()) {
                return $user->selectedSite()->id;
            }
        } catch (\Throwable $_) {
            // ignore
        }

        return null;
    }
}

class Media extends SpatieMedia
{
    protected $table = 'media';

    // Allow mass assignment where appropriate (we guard nothing here so Spatie can fill fields)
    protected $guarded = [];

    protected static function booted()
    {
        parent::booted();

        // Apply the global scope so every query filters by current site
        static::addGlobalScope(new SiteMediaScope());

        // Ensure site_id is set when creating a media record
        static::creating(function ($model) {
            // Diagnostic logging
            try {
                Log::debug('Media creating hook: model_class=' . get_class($model) . ', model_type=' . ($model->model_type ?? 'NULL') . ', model_id=' . ($model->model_id ?? 'NULL') . ', site_id=' . ($model->site_id ?? 'NULL') . ', sitecontext=' . (SiteContext::get() ?? 'NULL'));
            } catch (\Throwable $_) {
                // ignore logging failures
            }

            // 1) If media is being attached to a Site via Spatie's polymorphic fields, use that
            if (empty($model->site_id) && !empty($model->model_type) && !empty($model->model_id)) {
                // Normalize comparison to class name string
                $siteClass = \App\Models\Site::class;
                if ($model->model_type === $siteClass) {
                    $model->site_id = (int) $model->model_id;
                    return;
                }
            }

            // 2) Fallback to SiteContext or authenticated user's selected site
            if (empty($model->site_id)) {
                $siteId = SiteMediaScope::resolveSiteId();
                if ($siteId) {
                    $model->site_id = $siteId;
                }
            }
        });
    }

    // Relationship back to the Site (convenience)
    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'site_id');
    }
}

// ...existing code...

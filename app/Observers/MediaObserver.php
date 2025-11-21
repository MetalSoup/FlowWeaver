<?php

namespace App\Observers;

use App\Helpers\SiteContext;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Spatie\MediaLibrary\MediaCollections\Models\Media as SpatieMedia;

class MediaObserver
{
    public function creating(SpatieMedia $media): void
    {
        try {
            // If site_id already set, nothing to do
            if (!empty($media->site_id)) {
                return;
            }

            // If media is attached to a Site via polymorphic relation, use that
            if (!empty($media->model_type) && !empty($media->model_id)) {
                // handle both fully-qualified and prefixed cases
                $siteClass = \App\Models\Site::class;
                if ($media->model_type === $siteClass || str_ends_with($media->model_type, 'Site')) {
                    $media->site_id = (int) $media->model_id;
                    return;
                }
            }

            // Use SiteContext if set
            $siteId = SiteContext::get();
            if ($siteId) {
                $media->site_id = $siteId;
                return;
            }

            // Fallback to authenticated user's selected site
            try {
                $user = Auth::user();
                if ($user && method_exists($user, 'selectedSite') && $user->selectedSite()) {
                    $media->site_id = $user->selectedSite()->id;
                    return;
                }
            } catch (\Throwable $_) {
                // ignore
            }

            // If we reach here, leave site_id as null; DB migration should allow null to avoid failure
        } catch (\Throwable $e) {
            Log::error('MediaObserver creating failed: ' . $e->getMessage());
        }
    }
}


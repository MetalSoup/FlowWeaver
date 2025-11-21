<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Submission;
use App\Observers\SubmissionObserver;
use App\Observers\MediaObserver;
use App\Models\Media;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Submission::observe(SubmissionObserver::class);
        // Observe Media model to ensure site_id is set reliably
        if (class_exists(Media::class) && class_exists(MediaObserver::class)) {
            Media::observe(MediaObserver::class);
        }
    }
}

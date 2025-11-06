<?php

use App\Http\Controllers\FieldController;
use App\Http\Controllers\FlowController;
use App\Http\Controllers\InstanceController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SubmissionController;
use App\Http\Middleware\CheckInstanceSelectedMiddleware;
use App\Http\Middleware\SelectOrganizationMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Rap2hpoutre\LaravelLogViewer\LogViewerController;




Route::get('logs', [LogViewerController::class, 'index']);

Route::get('/',function () {
    return redirect()->route('login');
});

//disable csfr token
Route::any('/test_post', function(){
    // disable php debug bar
     \Debugbar::disable();
     //return the posted data as json
        return response()->json(request()->all());


})->withoutMiddleware([VerifyCsrfToken::class])->name('test_post');




Route::post('/submissions', [SubmissionController::class, 'store'])->name('submissions.store');
Route::put('/submissions/{submission}', [SubmissionController::class, 'update'])->name('submissions.update');

// ensure dashboard root requires both instance and organization selection
Route::get('/dashboard', function () {
    // Calculate submission counts for the last 30 days, grouped by day and scoped to the
    // selected instance/organization if available on the authenticated user. This provides
    // data to the frontend dashboard for charts/stats.
    $user = auth()->user();

    // Prefer persisted preferences on the user; preferences is the single source of truth.
    $selectedInstanceId = null;
    $selectedOrganizationId = null;
    if ($user) {
        if (method_exists($user, 'selectedInstance') && $user->selectedInstance()) {
            $selectedInstanceId = $user->selectedInstance()->id;
        }
        if (method_exists($user, 'selectedOrganization') && $user->selectedOrganization()) {
            $selectedOrganizationId = $user->selectedOrganization()->id;
        }
    }

    $query = \App\Models\Submission::query();

    // If the app associates submissions with instances or organizations, scope accordingly.
    // We'll guard these checks so the dashboard still works if the relationship columns don't exist.
    if ($selectedInstanceId && \Schema::hasColumn('submissions', 'instance_id')) {
        $query->where('instance_id', $selectedInstanceId);
    }
    if ($selectedOrganizationId && \Schema::hasColumn('submissions', 'organization_id')) {
        $query->where('organization_id', $selectedOrganizationId);
    }

    $start = now()->subDays(29)->startOfDay();

    $stats = $query->where('created_at', '>=', $start)
        ->selectRaw('DATE(created_at) as day, COUNT(*) as count')
        ->groupBy('day')
        ->orderBy('day')
        ->get()
        ->mapWithKeys(function ($row) {
            return [\Carbon\Carbon::parse($row->day)->toDateString() => (int) $row->count];
        });

    // Ensure all 30 days are present (fill zeros)
    $days = [];
    for ($i = 29; $i >= 0; $i--) {
        $d = now()->subDays($i)->toDateString();
        $days[$d] = $stats[$d] ?? 0;
    }

    return Inertia::render('Dashboard', [
        'submissionStats' => $days,
    ]);
})->middleware(['auth', 'verified', CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class])->name('dashboard');

//these routes should be in /dashboard/

Route::get('/flow/{flow}/{startNode?}', [FlowController::class, 'show'])->name('flow.show');


Route::middleware(['auth', CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class])->group(function () {
    Route::prefix('dashboard')->group(function () {
        // Ensure models being accessed belong to the user's selected instance
        Route::middleware([\App\Http\Middleware\EnsureModelBelongsToSelectedInstance::class])->group(function () {

            // The dashboard resources remain inside the group that already applies both selection middlewares
            Route::resource('/pages', PageController::class);
            Route::resource('/flows', FlowController::class);
            Route::resource('/fields', FieldController::class);

        });

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // Save user preferences (JSON partial update)
        Route::post('/preferences', [\App\Http\Controllers\PreferencesController::class, 'update'])->name('preferences.update');

        // Organizations select routes should be reachable without the selection middlewares
        Route::get('/organizations/select', [OrganizationController::class, 'select'])->name('organizations.select')->withoutMiddleware([CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class]);
        Route::get('/organizations/edit', [OrganizationController::class, 'edit'])->name('organizations.edit')->withoutMiddleware([CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class]);
        Route::post('/organizations/select', [OrganizationController::class, 'storeSelection'])->name('organizations.storeSelection')->withoutMiddleware([CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class]);
        Route::resource('/organizations', OrganizationController::class)->withoutMiddleware([CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class]);


        // Instance selection and management should be reachable without the selection middlewares
        Route::get('/instances/select', [InstanceController::class, 'select'])->name('instances.select')->withoutMiddleware([CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class]);
        Route::post('/instances/select', [InstanceController::class, 'storeSelection'])->name('instances.storeSelection')->withoutMiddleware([CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class]);
        Route::resource('/instances', InstanceController::class)->withoutMiddleware([CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class]);



    });
});

route::get('testcompiler/{flow}', [FlowController::class, 'compile']);
route::get('get_flow/{flow}', [FlowController::class, 'getFlow'])->name('get_flow');

// Page editor routes
//Route::get('/pages/{page}/edit', [PageController::class, 'edit'])->name('pages.edit');

// Note: removed duplicate non-prefixed POST/PUT routes for /pages that previously conflicted
// with the dashboard-prefixed resource routes. Using the dashboard resource (above) keeps
// middleware/session consistent and prevents route name resolution from pointing at the
// wrong endpoint (which could cause CSRF/session mismatch 419 errors).

// API endpoint to return submission stats for last 30 days (JSON)
Route::get('/dashboard/stats', function () {
    $user = auth()->user();

    $selectedInstanceId = null;
    $selectedOrganizationId = null;
    if ($user) {
        if (method_exists($user, 'selectedInstance') && $user->selectedInstance()) {
            $selectedInstanceId = $user->selectedInstance()->id;
        }
        if (method_exists($user, 'selectedOrganization') && $user->selectedOrganization()) {
            $selectedOrganizationId = $user->selectedOrganization()->id;
        }
    }

    $query = \App\Models\Submission::query();

    if ($selectedInstanceId && \Schema::hasColumn('submissions', 'instance_id')) {
        $query->where('instance_id', $selectedInstanceId);
    }
    if ($selectedOrganizationId && \Schema::hasColumn('submissions', 'organization_id')) {
        $query->where('organization_id', $selectedOrganizationId);
    }

    $start = now()->subDays(29)->startOfDay();

    $stats = $query->where('created_at', '>=', $start)
        ->selectRaw('DATE(created_at) as day, COUNT(*) as count')
        ->groupBy('day')
        ->orderBy('day')
        ->get()
        ->mapWithKeys(function ($row) {
            return [\Carbon\Carbon::parse($row->day)->toDateString() => (int) $row->count];
        });

    $days = [];
    for ($i = 29; $i >= 0; $i--) {
        $d = now()->subDays($i)->toDateString();
        $days[$d] = $stats[$d] ?? 0;
    }

    return response()->json(['submissionStats' => $days]);
})->middleware(['auth', 'verified', CheckInstanceSelectedMiddleware::class, SelectOrganizationMiddleware::class])->name('dashboard.stats');

require __DIR__.'/auth.php';

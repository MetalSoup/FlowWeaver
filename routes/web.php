<?php

use App\Http\Controllers\FieldController;
use App\Http\Controllers\FlowController;
use App\Http\Controllers\InstanceController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
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



Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

//these routes should be in /dashboard/

Route::get('/flow/{flow}/{startNode?}', [FlowController::class, 'show'])->name('flow.show');


Route::middleware('auth')->group(function () {
    Route::prefix('dashboard')->group(function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::get('/organizations/select', [OrganizationController::class, 'select'])->name('organizations.select');
        Route::get('/organizations/edit', [OrganizationController::class, 'edit'])->name('organizations.edit');
        Route::post('/organizations/select', [OrganizationController::class, 'storeSelection'])->name('organizations.storeSelection');
        Route::resource('/organizations', OrganizationController::class);


        Route::get('/instances/select', [InstanceController::class, 'select'])->name('instances.select');
        Route::post('/instances/select', [InstanceController::class, 'storeSelection'])->name('instances.storeSelection');
        Route::resource('/instances', InstanceController::class);

        /*Route::middleware([SelectOrganizationMiddleware::class,CheckInstanceSelectedMiddleware::class])->group(function () {*/

            Route::resource('/pages', PageController::class);
            // New route for the Craft.js based editor (Editor V2)
            Route::get('/pages/{page}/edit', [PageController::class, 'edit'])->name('pages.edit');
            Route::resource('/flows', FlowController::class);
            Route::resource('/fields', FieldController::class);

       /* });*/


    });
});

// Page editor routes
//Route::get('/pages/{page}/edit', [PageController::class, 'edit'])->name('pages.edit');
Route::post('/pages', [PageController::class, 'store'])->name('pages.store');
Route::put('/pages/{page}', [PageController::class, 'update'])->name('pages.update');

require __DIR__.'/auth.php';

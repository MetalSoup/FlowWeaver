<?php

use App\Http\Controllers\FieldController;
use App\Http\Controllers\FlowController;
use App\Http\Controllers\InstanceController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\CheckInstanceSelectedMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


//disable csfr token
Route::any('/test_post', function(){
    // disable php debug bar
     \Debugbar::disable();
     //return the posted data as json
        return response()->json(request()->all());


})->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])->name('test_post');



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

        Route::get('/instances/select', [InstanceController::class, 'select'])->name('instances.select');
        Route::post('/instances/select', [InstanceController::class, 'storeSelection'])->name('instances.storeSelection');
        Route::resource('/instances', InstanceController::class);

        Route::middleware(CheckInstanceSelectedMiddleware::class)->group(function () {

            Route::resource('/pages', PageController::class);
            Route::resource('/flows', FlowController::class);
            Route::resource('/fields', FieldController::class);

        });


    });
});

require __DIR__.'/auth.php';

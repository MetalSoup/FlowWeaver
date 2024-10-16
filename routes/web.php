<?php

use App\Http\Controllers\FieldController;
use App\Http\Controllers\FlowController;
use App\Http\Controllers\InstanceController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Models\Flow;
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

Route::get('/flow/{id}', [FlowController::class, 'show'])->name('flow.show'); //not working

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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/instances', [InstanceController::class, 'index'])->name('instances.index');
    Route::resource('/pages', PageController::class);
    Route::resource('/flows', FlowController::class);
    Route::resource('/fields', FieldController::class);
});

require __DIR__.'/auth.php';

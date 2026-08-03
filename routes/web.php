<?php

use App\Http\Controllers\DemoLoginController;
use App\Http\Controllers\DirectLinkController;
use App\Http\Controllers\FileRequestPageController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\ShareableLinkPageController;
use Common\Core\Controllers\HomeController;
use Common\Pages\CustomPageController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

if (config('app.demo')) {
    Route::post('demo-login', DemoLoginController::class)->withoutMiddleware(
        VerifyCsrfToken::class,
    );
}

//FRONT-END ROUTES THAT NEED TO BE PRE-RENDERED
Route::get('/', LandingPageController::class);
Route::get('drive/s/{hash}', ShareableLinkPageController::class);
Route::get('drive/r/{hash}', FileRequestPageController::class);
Route::get('d/{linkHash}/{fileHash}.{extension}', [
    DirectLinkController::class,
    'show',
]);

Route::get('contact', [HomeController::class, 'render']);
Route::get('pages/{slugOrId}', [CustomPageController::class, 'show']);
Route::get('login', [HomeController::class, 'render'])->name('login');
Route::get('register', [HomeController::class, 'render'])->name('register');
Route::get('forgot-password', [HomeController::class, 'render']);

//CATCH ALL ROUTES AND REDIRECT TO HOME
Route::fallback([HomeController::class, 'render']);

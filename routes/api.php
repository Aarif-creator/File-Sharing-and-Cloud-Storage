<?php

use App\Http\Controllers\DriveEntriesController;
use App\Http\Controllers\DuplicateEntriesController;
use App\Http\Controllers\FcmTokenController;
use App\Http\Controllers\FileRequestPageController;
use App\Http\Controllers\FileRequestPasswordController;
use App\Http\Controllers\FileRequestsController;
use App\Http\Controllers\FolderPathController;
use App\Http\Controllers\FoldersController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MoveFileEntriesController;
use App\Http\Controllers\ShareableLinkPageController;
use App\Http\Controllers\ShareableLinkPasswordController;
use App\Http\Controllers\ShareableLinksController;
use App\Http\Controllers\SharesController;
use App\Http\Controllers\SpaceUsageController;
use App\Http\Controllers\StarredEntriesController;
use App\Http\Controllers\WorkspaceFoldersController;
use App\Http\Controllers\TagsController;
use Illuminate\Support\Facades\Route;

// prettier-ignore
Route::group(['prefix' => 'v1'], function() {
  Route::group(['middleware' => ['optionalAuth:sanctum', 'verified', 'verifyApiAccess']], function () {
    Route::get('landing-page-data', LandingPageController::class);

    // SHARING
    Route::post('file-entries/{id}/share', [
      SharesController::class,
      'addUsers',
    ]);
    Route::post('file-entries/bulk/unshare', [
      SharesController::class,
      'removeUser',
    ]);
    Route::put('file-entries/{id}/change-permissions', [
      SharesController::class,
      'changePermissions',
    ]);

    // SHAREABLE LINK
    Route::get('file-entries/{id}/shareable-link', [
      ShareableLinksController::class,
      'show',
    ]);
    Route::post('file-entries/{id}/shareable-link', [
      ShareableLinksController::class,
      'store',
    ]);
    Route::put('file-entries/{id}/shareable-link', [
      ShareableLinksController::class,
      'update',
    ]);
    Route::delete('file-entries/{id}/shareable-link', [
      ShareableLinksController::class,
      'destroy',
    ]);
    Route::post('shareable-links/{linkId}/import', [
      ShareableLinksController::class,
      'importIntoOwnDrive',
    ]);

    // FILE REQUESTS
    Route::get('file-requests', [FileRequestsController::class, 'index']);
    Route::post('file-requests', [FileRequestsController::class, 'store']);
    Route::get('file-requests/{id}', [FileRequestsController::class, 'show']);
    Route::put('file-requests/{id}', [
      FileRequestsController::class,
      'update',
    ]);
    Route::delete('file-requests/{id}', [
      FileRequestsController::class,
      'destroy',
    ]);
    Route::post('file-requests/{id}/close', [
      FileRequestsController::class,
      'close',
    ]);
    Route::post('file-requests/{id}/reopen', [
      FileRequestsController::class,
      'reopen',
    ]);
    Route::post('file-requests/{id}/send-email', [
      FileRequestsController::class,
      'sendEmail',
    ]);

    // ENTRIES
    Route::get('drive/file-entries/{fileEntry}/model', [
      DriveEntriesController::class,
      'showModel',
    ]);
    Route::get('drive/file-entries', [
      DriveEntriesController::class,
      'index',
    ]);
    Route::put('drive/file-entries/{id}', [
      DriveEntriesController::class,
      'update',
    ]);
    Route::post('file-entries/move', [
      MoveFileEntriesController::class,
      'move',
    ]);
    Route::post('file-entries/duplicate', [
      DuplicateEntriesController::class,
      'duplicate',
    ]);

    // FOLDERS
    Route::post('folders', [FoldersController::class, 'store']);
    Route::get('drive/workspace-folders', [
      WorkspaceFoldersController::class,
      'index',
    ]);
    Route::get('folders/{hash}/path', [
      FolderPathController::class,
      'show',
    ]);

    // TAGS
    Route::get('tags', [TagsController::class, 'index']);
    Route::post('tags', [TagsController::class, 'store']);
    Route::put('tags/{id}', [TagsController::class, 'update']);
    Route::delete('tags/bulk', [TagsController::class, 'bulkDelete']);

    // Labels
    Route::post('file-entries/star', [
      StarredEntriesController::class,
      'add',
    ]);
    Route::post('file-entries/unstar', [
      StarredEntriesController::class,
      'remove',
    ]);

    //SPACE USAGE
    Route::get('user/space-usage', [SpaceUsageController::class, 'index']);

    // FCM TOKENS
    Route::post('fcm-token', [FcmTokenController::class, 'store']);
  });

  //SHAREABLE LINK PAGE (NO AUTH NEEDED)
  Route::get('shareable-link-page/{hash}', ShareableLinkPageController::class);
  Route::post('shareable-link-page/{hash}/check-password', [
    ShareableLinkPasswordController::class,
    'check',
  ]);

  //FILE REQUEST PAGE (NO AUTH NEEDED)
  // todo: test
  Route::get('file-request-page/{hash}', FileRequestPageController::class);
  Route::post('file-request-page/{hash}/check-password', [
    FileRequestPasswordController::class,
    'check',
  ]);
});

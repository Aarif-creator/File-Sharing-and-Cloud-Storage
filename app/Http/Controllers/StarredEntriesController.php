<?php

namespace App\Http\Controllers;

use App\Models\FileEntry;
use App\Services\Entries\StarEntries;
use App\Services\Entries\UnstarEntries;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

#[Group('Files', weight: 1)]
class StarredEntriesController extends Controller
{
    /**
     * Star files.
     *
     * @operationId starEntries
     */
    public function add(Request $request)
    {
        $data = $request->validate([
            'entryIds' => 'required|array|exists:file_entries,id',
            'entryIds.*' => 'required|integer',
        ]);

        Gate::authorize('index', [FileEntry::class, $data['entryIds']]);

        (new StarEntries())->execute($data['entryIds'], Auth::id());

        return response()->noContent();
    }

    /**
     * Unstar files.
     *
     * @operationId unstarEntries
     */
    public function remove(Request $request)
    {
        $data = $request->validate([
            'entryIds' => 'required|array|exists:file_entries,id',
            'entryIds.*' => 'required|integer',
        ]);

        Gate::authorize('index', [FileEntry::class, $data['entryIds']]);

        (new UnstarEntries())->execute($data['entryIds'], Auth::id());

        return response()->noContent();
    }
}

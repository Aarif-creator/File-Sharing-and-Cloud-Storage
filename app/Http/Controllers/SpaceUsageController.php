<?php

namespace App\Http\Controllers;

use Common\API\ExcludeRoutesFromPublicDocs;
use Illuminate\Support\Facades\Auth;
use Common\Files\Actions\GetUserSpaceUsage;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

/**
 * @tags Files
 */
#[ExcludeRoutesFromPublicDocs]
class SpaceUsageController extends Controller
{
    /**
     * Get user space usage.
     *
     * @operationId getUserSpaceUsage
     */
    public function index()
    {
        Gate::authorize('show', Auth::user());

        $usage = (new GetUserSpaceUsage(uploadType: 'bedrive'))->execute();

        return response()->json($usage);
    }
}

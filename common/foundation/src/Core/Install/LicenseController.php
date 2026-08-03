<?php

namespace Common\Core\Install;

use Common\Core\Demo\BlockedOnDemoSite;
use Common\Settings\DotEnvEditor;
use Common\API\ExcludeRoutesFromPublicDocs;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/**
 * @tags License
 */
#[ExcludeRoutesFromPublicDocs]
class LicenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('isAdmin');
    }

    /**
     * Register purchase code
     *
     * @operationId registerPurchaseCode
     */
    #[BlockedOnDemoSite]
    public function registerPurchaseCode(Request $request)
    {
        $data = $request->validate([
            'purchase_code' => 'required|string',
            'module' => 'string',
        ]);

        $registeredCode = trim((string) $data['purchase_code']);
        if ($registeredCode === '') {
            abort(422, 'Purchase code cannot be empty.');
        }

        $moduleName = $data['module'] ?? null;
        $key = 'ENVATO_PURCHASE_CODE';

        if ($moduleName) {
            $key = strtoupper($moduleName) . '_ENVATO_PURCHASE_CODE';
        }

        (new DotEnvEditor())->write([
            $key => $registeredCode,
        ]);

        return response()->json([
            /** @var string */
            'purchase_code' => $registeredCode,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Common\API\ExcludeRoutesFromPublicDocs;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

/**
 * @tags Notifications
 */
#[ExcludeRoutesFromPublicDocs]
class FcmTokenController extends Controller
{
    /**
     * Store FCM token.
     *
     * @operationId storeFcmToken
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'deviceId' => 'required|string',
        ]);

        Auth::user()
            ->fcmTokens()
            ->where(['device_id' => $data['deviceId']])
            ->delete();

        Auth::user()
            ->fcmTokens()
            ->create([
                'token' => $data['token'],
                'device_id' => $data['deviceId'],
            ]);

        return response()->json(['token' => $data['token']]);
    }
}

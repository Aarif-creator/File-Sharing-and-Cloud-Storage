<?php

namespace App\Services\Links;

use App\Models\ShareableLink;
use Illuminate\Support\Arr;
use Carbon\Carbon;
use Illuminate\Support\Str;

class CrupdateShareableLink
{
    public function execute(
        array $params,
        int $entryId,
        ShareableLink|null $link = null,
    ) {
        $params = [
            'user_id' => $params['user_id'],
            'password' => $params['password'] ?? null,
            'allow_download' => $params['allow_download'] ?? true,
            'allow_direct' => $params['allow_direct'] ?? false,
            'allow_edit' => $params['allow_edit'] ?? false,
            'expires_at' => Arr::get($params, 'expires_at')
                ? Carbon::parse($params['expires_at'])
                : null,
        ];

        if ($link !== null) {
            $link->fill($params)->save();
        } else {
            $link = ShareableLink::create([
                ...$params,
                'entry_id' => $entryId,
                'hash' => Str::random(30),
            ]);
        }

        return $link;
    }
}

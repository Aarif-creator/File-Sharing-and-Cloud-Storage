<?php

namespace App\Http\Controllers;

use App\Models\ShareableLink;
use App\Services\Links\ValidatesLinkPassword;
use Common\Files\Response\FileResponseFactory;
use Illuminate\Routing\Controller;

class DirectLinkController extends Controller
{
    use ValidatesLinkPassword;

    public function show(string $linkHash, string $fileHash, string $extension)
    {
        $link = ShareableLink::query()
            ->where('hash', $linkHash)
            ->with('entry')
            ->firstOrFail();

        $entry = $link->entry;

        if (
            !$link->allow_direct ||
            !$entry ||
            $entry->trashed() ||
            !$this->linkPasswordIsValid($link)
        ) {
            abort(404);
        }

        if ($entry->type === 'folder') {
            $entry = $entry
                ->allChildren()
                ->where('hash', $fileHash)
                ->firstOrFail();
        }

        return (new FileResponseFactory())->create($entry);
    }
}

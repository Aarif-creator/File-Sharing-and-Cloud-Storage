<?php

namespace App\Http\Controllers;

use App\Models\FileEntry;
use App\Models\User;
use App\Notifications\FileEntrySharedNotif;
use App\Services\Shares\AttachUsersToEntry;
use App\Services\Shares\DetachUsersFromEntries;
use Common\Core\BaseController;
use Common\Files\Traits\ChunksChildEntries;
use Common\Validation\Validators\EmailsAreValid;
use Dedoc\Scramble\Attributes\Group;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;

#[Group('Sharing', weight: 1)]
class SharesController extends BaseController
{
    use ChunksChildEntries;

    /**
     * Share files.
     *
     * @operationId shareEntry
     */
    public function addUsers(int $id, Request $request)
    {
        $fileEntry = FileEntry::query()->findOrFail($id);

        $data = $request->validate([
            'emails' => ['required', 'array', 'min:1', new EmailsAreValid()],
            /** @var array{view?: boolean, edit?: boolean, download?: boolean} */
            'permissions' => 'required|array',
        ]);

        Gate::authorize('update', $fileEntry);

        $sharees = (new AttachUsersToEntry())->execute(
            $data['emails'],
            [$fileEntry],
            $data['permissions'],
        );

        if (settings('drive.send_share_notification')) {
            try {
                Notification::send(
                    $sharees,
                    new FileEntrySharedNotif([$fileEntry->id], Auth::user()),
                );
            } catch (Exception $e) {
                report($e);
            }
        }

        return response()->noContent();
    }

    /**
     * Change shared file permissions.
     *
     * @operationId changeSharedEntryPermissions
     */
    public function changePermissions(int $id, Request $request)
    {
        $fileEntry = FileEntry::query()->findOrFail($id);

        $data = $request->validate([
            /** @var array{view?: boolean, edit?: boolean, download?: boolean} */
            'permissions' => 'required|array',
            'user_id' => 'required|int',
        ]);

        Gate::authorize('update', $fileEntry);

        $this->chunkChildEntries([$fileEntry], function (
            Collection $chunk,
        ) use ($data) {
            DB::table('file_entry_models')
                ->where('model_id', $data['user_id'])
                ->where('model_type', User::MODEL_TYPE)
                ->whereIn('file_entry_id', $chunk->pluck('id'))
                ->update([
                    'permissions' => json_encode($data['permissions']),
                ]);
        });

        return response()->noContent();
    }

    /**
     * Unshare files.
     *
     * @operationId unshareEntries
     */
    public function removeUser(Request $request)
    {
        $data = $request->validate([
            'entry_ids' => 'required|array|min:1|exists:file_entries,id',
            'entry_ids.*' => 'required|int',
            'user_id' => 'required|int',
        ]);

        $fileEntries = FileEntry::query()
            ->with('users')
            ->whereIn('id', $data['entry_ids'])
            ->get();

        $userId = $data['user_id'] === 'me' ? Auth::id() : $data['user_id'];

        // there's no need to authorize if user is
        // trying to remove himself from the entry
        if ($userId !== Auth::id()) {
            Gate::authorize('update', [FileEntry::class, $fileEntries]);
        }

        $this->chunkChildEntries($fileEntries, function ($chunk) use ($userId) {
            (new DetachUsersFromEntries())->execute($chunk, [$userId]);
        });

        return response()->noContent();
    }
}

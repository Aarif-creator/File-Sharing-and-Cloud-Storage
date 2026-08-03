<?php

namespace App\Http\Controllers;

use App\Models\FileEntry;
use App\Resources\DriveEntryResource;
use App\Services\Entries\GetEntryPermissions;
use Common\Core\BaseController;
use Common\Files\Events\FileEntriesMoved;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

#[Group('Files', weight: 1)]
class MoveFileEntriesController extends Controller
{
    /**
     * Move files
     *
     * @operationId moveFileEntries
     */
    public function move(Request $request)
    {
        $data = $request->validate([
            'entryIds' => 'required|array|max:30',
            'entryIds.*' => 'required|integer',
            'destinationId' => 'nullable|integer|exists:file_entries,id',
        ]);

        $destinationId = $data['destinationId'] ?? null;

        $newParent = $this->getNewParent($destinationId);
        abort_if(
            $newParent && $newParent->type !== 'folder',
            422,
            'Destination must be a folder',
        );

        $entries = $this->getEntries(collect($data['entryIds']));
        $entries = $this->removeInvalidEntries($entries, $newParent);

        // there was an issue with entries or parent, bail
        if ($entries->isEmpty()) {
            abort(422, 'No valid entries to move');
        }

        Gate::authorize('update', [FileEntry::class, $entries]);

        $this->updateParent($destinationId, $entries);
        $source = $entries->first()->parent_id;

        $entries->each(function (FileEntry $entry) use (
            $newParent,
            $destinationId,
        ) {
            $entry->parent_id = $destinationId;
            $oldPath = $entry->path;
            $newPath = $newParent === null ? '' : $newParent->path;
            $oldParent = last(explode('/', $oldPath));
            $newPath .= "/$oldParent";
            app(FileEntry::class)->updatePaths($oldPath, $newPath);
            $entry->path = $newPath;
        });

        event(
            new FileEntriesMoved(
                $entries->pluck('id')->toArray(),
                $destinationId,
                $source,
            ),
        );

        return DriveEntryResource::collection($entries)->additional([
            'destination' => new DriveEntryResource($newParent),
        ]);
    }

    /**
     * Make sure entries can't be moved into themselves or their children.
     */
    private function removeInvalidEntries(
        Collection $targets,
        ?FileEntry $destination,
    ) {
        if ($destination == null) {
            return $targets;
        }

        return $targets->filter(
            fn($entry) => $this->canMoveEntriesInto($entry, $destination),
        );
    }

    private function getNewParent(int|null $destination): FileEntry|null
    {
        if (!$destination) {
            return null;
        }
        return FileEntry::query()->find($destination);
    }

    /**
     * @return Collection
     */
    private function getEntries(Collection $entryIds)
    {
        return FileEntry::query()
            ->with('users')
            ->whereIn('id', $entryIds)
            ->get();
    }

    private function updateParent(?int $destination, Collection $entries)
    {
        FileEntry::query()
            ->whereIn('id', $entries->pluck('id'))
            ->update(['parent_id' => $destination]);
    }

    private function canMoveEntriesInto(
        FileEntry $target,
        FileEntry $destination,
    ): bool {
        if (
            $destination->id === $target->parent_id ||
            // root folder check
            (!$target->parent_id && !$destination->id)
        ) {
            return false;
        }

        $destinationPath = explode('/', $destination->path ?: '');
        $targetPath = explode('/', $target->path ?: '');

        // destination is already in target
        return !collect($targetPath)->every(
            fn($part, $i) => ($destinationPath[$i] ?? null) === $part,
        );
    }
}

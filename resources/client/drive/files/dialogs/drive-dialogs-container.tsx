import {driveState, useDriveStore} from '@app/drive/drive-store';
import {BlockTrashFolderViewDialog} from '@app/drive/files/dialogs/block-trash-folder-view-dialog';
import {DeleteEntriesForeverDialog} from '@app/drive/files/dialogs/delete-entries-forever-dialog';
import {EntryPreviewDialog} from '@app/drive/files/dialogs/entry-preview-dialog';
import {MoveEntriesDialog} from '@app/drive/files/dialogs/move-entries-dialog/move-entries-dialog';
import {NewFolderDialog} from '@app/drive/files/dialogs/new-folder-dialog';
import {RenameEntryDialog} from '@app/drive/files/dialogs/rename-entry-dialog';
import {ShareDialog} from '@app/drive/share-dialog/share-dialog';

export function DriveDialogsContainer() {
  const activeDialog = useDriveStore(s => s.activeActionDialog);

  if (activeDialog?.name === 'rename' && activeDialog.entries[0]) {
    return (
      <RenameEntryDialog
        entry={activeDialog.entries[0]}
        open
        onOpenChange={open => {
          if (!open) {
            driveState().setActiveActionDialog(null);
          }
        }}
      />
    );
  }

  if (activeDialog?.name === 'newFolder') {
    return (
      <NewFolderDialog
        parentId={activeDialog.entries[0]?.id}
        open
        onOpenChange={open => {
          if (!open) {
            driveState().setActiveActionDialog(null);
          }
        }}
      />
    );
  }

  if (activeDialog?.name === 'moveTo') {
    return (
      <MoveEntriesDialog
        entries={activeDialog.entries}
        open
        onOpenChange={open => {
          if (!open) {
            driveState().setActiveActionDialog(null);
          }
        }}
      />
    );
  }

  if (activeDialog?.name === 'share' && activeDialog.entries[0]) {
    return (
      <ShareDialog
        entry={activeDialog.entries[0]}
        open
        onOpenChange={open => {
          if (!open) {
            driveState().setActiveActionDialog(null);
          }
        }}
      />
    );
  }

  if (activeDialog?.name === 'confirmAndDeleteForever') {
    return (
      <DeleteEntriesForeverDialog
        entries={activeDialog.entries}
        open
        onOpenChange={open => {
          if (!open) {
            driveState().setActiveActionDialog(null);
          }
        }}
      />
    );
  }

  if (activeDialog?.name === 'trashFolderBlock') {
    return (
      <BlockTrashFolderViewDialog
        entries={activeDialog.entries}
        open
        onOpenChange={open => {
          if (!open) {
            driveState().setActiveActionDialog(null);
          }
        }}
      />
    );
  }

  if (activeDialog?.name === 'preview' && activeDialog.entries[0]) {
    return (
      <EntryPreviewDialog
        selectedEntry={activeDialog.entries[0]}
        open
        onOpenChange={open => {
          if (!open) {
            driveState().setActiveActionDialog(null);
          }
        }}
      />
    );
  }

  return null;
}

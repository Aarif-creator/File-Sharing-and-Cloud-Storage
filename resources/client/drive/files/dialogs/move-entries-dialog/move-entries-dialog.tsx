import {RootFolderPage} from '@app/drive/drive-page/drive-page';
import {useDriveStore} from '@app/drive/drive-store';
import {MoveEntriesDialogBreadcrumbs} from '@app/drive/files/dialogs/move-entries-dialog/move-entries-dialog-breadcrumbs';
import {MoveEntriesDialogFolderList} from '@app/drive/files/dialogs/move-entries-dialog/move-entries-dialog-folder-list';
import {MoveEntriesDialogSearch} from '@app/drive/files/dialogs/move-entries-dialog/move-entries-dialog-search';
import {NewFolderDialog} from '@app/drive/files/dialogs/new-folder-dialog';
import {useMoveEntries} from '@app/drive/files/queries/use-move-entries';
import {canMoveEntriesInto} from '@app/drive/files/utils/can-move-entries-into';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {useAuth} from '@common/auth/use-auth';
import {useControlledState} from '@react-stately/utils';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Trans} from '@ui/i18n/trans';
import {FolderPlusIcon} from 'lucide-react';
import {useState} from 'react';

type MoveEntriesDialogProps = {
  entries: DriveEntry[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function MoveEntriesDialog({
  entries,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: MoveEntriesDialogProps) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <DialogContent entries={entries} onClose={() => setOpen(false)} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogContent({
  entries,
  onClose,
}: {
  entries: DriveEntry[];
  onClose: () => void;
}) {
  const {user} = useAuth();
  const activePage = useDriveStore(s => s.activePage);
  const [selectedFolder, setSelectedFolder] = useState<DriveEntry>(
    activePage?.folder || RootFolderPage.folder!,
  );
  const movingSharedFiles = entries.some(
    e => !e.users?.find(u => u.id === user!.id)?.owns_entry,
  );

  return (
    <Dialog.Content className="sm:max-w-lg">
      <Dialog.Header>
        <Dialog.Title>
          <Trans
            message="Move [one ‘:name‘|other :count items]"
            values={{
              count: entries.length,
              name: entries[0].name,
            }}
          />
        </Dialog.Title>
        <Dialog.Description>
          <Trans message="Select a destination folder." />
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Body>
        <MoveEntriesDialogSearch onFolderSelected={setSelectedFolder} />
        <div className="mt-10 mb-5">
          <MoveEntriesDialogBreadcrumbs
            selectedFolder={selectedFolder}
            onFolderSelected={setSelectedFolder}
          />
          <MoveEntriesDialogFolderList
            movingSharedFiles={movingSharedFiles}
            selectedFolder={selectedFolder}
            onFolderSelected={setSelectedFolder}
          />
        </div>
      </Dialog.Body>
      <Footer
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        entries={entries}
        onClose={onClose}
      />
    </Dialog.Content>
  );
}

type FooterProps = {
  selectedFolder: DriveEntry;
  setSelectedFolder: (folder: DriveEntry) => void;
  entries: DriveEntry[];
  onClose: () => void;
};

function Footer({
  selectedFolder,
  setSelectedFolder,
  entries,
  onClose,
}: FooterProps) {
  const moveEntries = useMoveEntries();

  return (
    <Dialog.Footer variant="muted" className="bg-popover sm:justify-between">
      <NewFolderDialog
        parentId={selectedFolder.id}
        onFolderCreated={setSelectedFolder}
      >
        <Dialog.Trigger render={<Button variant="outline" />}>
          <FolderPlusIcon />
          <Trans message="New Folder" />
        </Dialog.Trigger>
      </NewFolderDialog>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Dialog.CloseButton className="max-md:hidden">
          <Trans message="Cancel" />
        </Dialog.CloseButton>
        <Button
          disabled={
            !canMoveEntriesInto(entries, selectedFolder) ||
            moveEntries.isPending
          }
          onClick={() => {
            moveEntries.mutate(
              {
                destinationId: selectedFolder.id,
                entryIds: entries.map(e => e.id),
              },
              {onSuccess: onClose},
            );
          }}
        >
          <Trans message="Move here" />
        </Button>
      </div>
    </Dialog.Footer>
  );
}

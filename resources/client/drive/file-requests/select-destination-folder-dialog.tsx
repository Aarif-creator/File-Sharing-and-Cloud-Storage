import {RootFolderPage} from '@app/drive/drive-page/drive-page';
import {MoveEntriesDialogBreadcrumbs} from '@app/drive/files/dialogs/move-entries-dialog/move-entries-dialog-breadcrumbs';
import {MoveEntriesDialogFolderList} from '@app/drive/files/dialogs/move-entries-dialog/move-entries-dialog-folder-list';
import {MoveEntriesDialogSearch} from '@app/drive/files/dialogs/move-entries-dialog/move-entries-dialog-search';
import {NewFolderDialog} from '@app/drive/files/dialogs/new-folder-dialog';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {useControlledState} from '@react-stately/utils';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Trans} from '@ui/i18n/trans';
import {FolderPlusIcon} from 'lucide-react';
import {ComponentProps, ReactElement, useState} from 'react';

type SelectDestinationFolderDialogProps = {
  children?: ReactElement<ComponentProps<typeof Dialog.Trigger>>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFolderSelected: (folder: DriveEntry) => void;
};

export function SelectDestinationFolderDialog({
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  onFolderSelected,
}: SelectDestinationFolderDialogProps) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <DialogContent
          onFolderSelected={folder => {
            onFolderSelected(folder);
            setOpen(false);
          }}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogContent({
  onFolderSelected,
}: {
  onFolderSelected: (folder: DriveEntry) => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState<DriveEntry>(
    RootFolderPage.folder!,
  );

  return (
    <Dialog.Content className="sm:max-w-lg">
      <Dialog.Header>
        <Dialog.Title>
          <Trans message="Select folder" />
        </Dialog.Title>
        <Dialog.Description>
          <Trans message="Uploaded files will be added to this folder in your drive." />
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
            movingSharedFiles={false}
            selectedFolder={selectedFolder}
            onFolderSelected={setSelectedFolder}
          />
        </div>
      </Dialog.Body>
      <Dialog.Footer variant="muted" className="bg-popover sm:justify-between">
        <NewFolderDialog
          parentId={selectedFolder.id || null}
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
          <Button onClick={() => onFolderSelected(selectedFolder)}>
            <Trans message="Select" />
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog.Content>
  );
}

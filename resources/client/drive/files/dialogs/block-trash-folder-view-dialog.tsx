import {driveState} from '@app/drive/drive-store';
import {useRestoreEntries} from '@app/drive/files/queries/use-restore-entries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {useControlledState} from '@react-stately/utils';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Trans} from '@ui/i18n/trans';

type BlockTrashFolderViewDialogProps = {
  entries: DriveEntry[];
  children?: AlertDialog.TriggerElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function BlockTrashFolderViewDialog({
  entries,
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: BlockTrashFolderViewDialogProps) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);
  const restoreEntries = useRestoreEntries();

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Content size="sm">
          <AlertDialog.Header>
            <AlertDialog.Title>
              <Trans message="This folder is in your trash" />
            </AlertDialog.Title>
            <AlertDialog.Description>
              <Trans message="To view it, you need to restore it from the trash first." />
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>
              <Trans message="Cancel" />
            </AlertDialog.Cancel>
            <AlertDialog.Action
              disabled={restoreEntries.isPending}
              onClick={() => {
                restoreEntries.mutate(
                  {
                    entryIds: entries.map(e => e.id),
                  },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      driveState().selectEntries([]);
                    },
                  },
                );
              }}
            >
              <Trans message="Restore" />
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

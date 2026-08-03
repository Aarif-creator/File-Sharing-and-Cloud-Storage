import {driveState} from '@app/drive/drive-store';
import {useDeleteEntries} from '@app/drive/files/queries/use-delete-entries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {useControlledState} from '@react-stately/utils';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Trans} from '@ui/i18n/trans';

type DeleteEntriesForeverDialogProps = {
  entries: DriveEntry[];
  children?: AlertDialog.TriggerElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function DeleteEntriesForeverDialog({
  entries,
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: DeleteEntriesForeverDialogProps) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);
  const deleteEntries = useDeleteEntries();

  const message =
    entries.length === 1 ? (
      <Trans
        message="‘:name‘ will be deleted forever and you won't be able to restore it."
        values={{name: entries[0].name}}
      />
    ) : (
      <Trans
        message=":count items will be deleted forever and you won't be able to restore them."
        values={{count: entries.length}}
      />
    );

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Content size="sm">
          <AlertDialog.Header>
            <AlertDialog.Title>
              <Trans message="Delete forever?" />
            </AlertDialog.Title>
            <AlertDialog.Description>{message}</AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>
              <Trans message="Cancel" />
            </AlertDialog.Cancel>
            <AlertDialog.Action
              color="danger"
              disabled={deleteEntries.isPending}
              onClick={() => {
                deleteEntries.mutate(
                  {
                    entryIds: entries.map(e => e.id),
                    deleteForever: true,
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
              <Trans message="Delete forever" />
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

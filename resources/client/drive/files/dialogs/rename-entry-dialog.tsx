import {updateEntryOptions} from '@app/app-queries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {useControlledState} from '@react-stately/utils';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {ComponentProps, ReactElement} from 'react';
import {useForm} from 'react-hook-form';

type FormValue = {
  name: string;
};

type RenameEntryDialogProps = {
  entry: DriveEntry;
  children?: ReactElement<ComponentProps<typeof Dialog.Trigger>>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function RenameEntryDialog({
  entry,
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: RenameEntryDialogProps) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <DialogContent entry={entry} onClose={() => setOpen(false)} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogContent({
  entry,
  onClose,
}: {
  entry: DriveEntry;
  onClose: () => void;
}) {
  const initialName = entry.name;
  const form = useForm<FormValue>({defaultValues: {name: initialName}});
  const renameEntry = useMutation(updateEntryOptions(entry.id));

  const handleSubmit = (value: FormValue) => {
    renameEntry.mutate(
      {name: value.name},
      {
        onSuccess: () => {
          toast.success(
            <Trans
              message=":oldName renamed to :newName"
              values={{oldName: initialName, newName: value.name}}
            />,
          );
          onClose();
        },
        onError: err => onFormQueryError(err, form, [], true),
      },
    );
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Rename" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <HookForm.Field name="name">
            <Field.Label className="sr-only">
              <Trans message="Name" />
            </Field.Label>
            <Input
              placeholder="Enter a name..."
              aria-label="Entry name"
              autoFocus
              required
              minLength={3}
              maxLength={200}
              onFocus={e => e.currentTarget.select()}
            />
            <Field.Error />
          </HookForm.Field>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button
            type="submit"
            disabled={renameEntry.isPending || !form.formState.isDirty}
          >
            <Trans message="Rename" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}

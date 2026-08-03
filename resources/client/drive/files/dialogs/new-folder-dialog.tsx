import {createFolderOptions} from '@app/app-queries';
import type {CreateFolder200} from '@app/gen/schemas/create-folder200';
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
import {useTrans} from '@ui/i18n/use-trans';
import {ComponentProps, ReactElement, useRef} from 'react';
import {useForm} from 'react-hook-form';

type FormValue = {
  name: string;
};

type NewFolderDialogProps = {
  parentId?: number | null;
  children?: ReactElement<ComponentProps<typeof Dialog.Trigger>>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFolderCreated?: (folder: CreateFolder200['data']) => void;
};

export function NewFolderDialog({
  parentId,
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  onFolderCreated,
}: NewFolderDialogProps) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <DialogContent
          parentId={parentId}
          onFolderCreated={folder => {
            onFolderCreated?.(folder);
            setOpen(false);
          }}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogContent({
  parentId,
  onFolderCreated,
}: {
  parentId?: number | null;
  onFolderCreated: (folder: CreateFolder200['data']) => void;
}) {
  const {trans} = useTrans();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<FormValue>({
    defaultValues: {
      name: trans({message: 'Untitled Folder'}),
    },
  });
  const createFolder = useMutation(createFolderOptions());

  const handleSubmit = (value: FormValue) => {
    createFolder.mutate(
      {name: value.name, parent_id: parentId ? parentId : null},
      {
        onSuccess: response => {
          toast.success(<Trans message="Folder created" />);
          onFolderCreated(response.data);
        },
        onError: err => onFormQueryError(err, form, [], true),
      },
    );
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content
        initialFocus={() => {
          const input = nameInputRef.current;
          if (!input) return true;
          // Select after Base UI applies focus so the default name is replaced on type.
          queueMicrotask(() => input.select());
          return input;
        }}
      >
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="New Folder" />
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <HookForm.Field name="name">
            <Field.Label>
              <Trans message="Name" />
            </Field.Label>
            <Input
              ref={nameInputRef}
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
          <Button type="submit" disabled={createFolder.isPending}>
            <Trans message="Create" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}

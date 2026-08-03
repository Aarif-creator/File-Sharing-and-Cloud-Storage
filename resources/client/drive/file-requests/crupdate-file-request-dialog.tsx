import {
  createFileRequestOptions,
  updateFileRequestOptions,
} from '@app/app-queries';
import {SelectDestinationFolderDialog} from '@app/drive/file-requests/select-destination-folder-dialog';
import {CrupdateFileRequestRequest} from '@app/gen/schemas/crupdate-file-request-request';
import {FileRequest} from '@app/gen/schemas/file-request';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {getLocalTimeZone, now} from '@internationalized/date';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Switch} from '@shadcn/forms/switch/switch';
import {Textarea} from '@shadcn/forms/textarea/textarea';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {FormDatePicker} from '@ui/forms/input-field/date/date-picker/date-picker';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {ChevronDownIcon, FolderIcon} from 'lucide-react';
import {ReactElement, useState} from 'react';
import {useForm, useFormContext} from 'react-hook-form';

const minDate = now(getLocalTimeZone());

interface Props {
  children?: ReactElement<typeof Dialog.Trigger>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileRequest?: FileRequest;
}

export function CrupdateFileRequestDialog({
  children,
  open,
  onOpenChange,
  fileRequest,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <DialogContent
          fileRequest={fileRequest}
          onSaved={() => onOpenChange(false)}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogContent({
  fileRequest,
  onSaved,
}: {
  fileRequest?: FileRequest;
  onSaved: () => void;
}) {
  const {trans} = useTrans();
  const isUpdating = fileRequest != null;
  const form = useForm<CrupdateFileRequestRequest>({
    defaultValues: {
      title: fileRequest?.title ?? '',
      description: fileRequest?.description ?? '',
      folder_id: fileRequest?.folder_id ?? null,
      deadline: fileRequest?.deadline ?? null,
      allow_late_uploads: fileRequest?.allow_late_uploads ?? false,
    },
  });

  const createRequest = useMutation(createFileRequestOptions());
  const updateRequest = useMutation(
    updateFileRequestOptions(fileRequest?.id ?? 0),
  );
  const mutation = isUpdating ? updateRequest : createRequest;

  const handleSubmit = (values: CrupdateFileRequestRequest) => {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(
          isUpdating ? (
            <Trans message="File request updated" />
          ) : (
            <Trans message="File request created" />
          ),
        );
        onSaved();
      },
      onError: err => onFormQueryError(err, form),
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content className="md:max-w-xl">
        <Dialog.Header>
          <Dialog.Title>
            {isUpdating ? (
              <Trans message="Edit file request" />
            ) : (
              <Trans message="Request files" />
            )}
          </Dialog.Title>
          <Dialog.Description>
            <Trans message="Collect files from anyone, even if they don't have an account." />
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body className="py-2">
          <Field.Group>
            <HookForm.Field name="title">
              <Field.Label>
                <Trans message="Title" />
              </Field.Label>
              <Input
                autoFocus
                required
                maxLength={250}
                placeholder={trans({
                  message: 'Explain what the request is for',
                })}
              />
              <Field.Error />
            </HookForm.Field>
            <HookForm.Field name="description">
              <Field.Label>
                <Trans message="Description" />
              </Field.Label>
              <Textarea
                rows={3}
                maxLength={2000}
                placeholder={trans({
                  message: 'Add any extra details about the request',
                })}
              />
              <Field.Error />
            </HookForm.Field>
            <DestinationFolderField
              initialFolderName={fileRequest?.folder?.name}
            />
            <DeadlineField hasDeadline={!!fileRequest?.deadline} />
            <PasswordField hasPassword={!!fileRequest?.has_password} />
          </Field.Group>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button type="submit" disabled={mutation.isPending}>
            {isUpdating ? <Trans message="Save" /> : <Trans message="Create" />}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}

function DestinationFolderField({
  initialFolderName,
}: {
  initialFolderName?: string;
}) {
  const {setValue} = useFormContext<CrupdateFileRequestRequest>();
  const [folderName, setFolderName] = useState(initialFolderName);

  return (
    <HookForm.Field name="folder_id">
      <Field.Label>
        <Trans message="Folder for uploaded files" />
      </Field.Label>
      <SelectDestinationFolderDialog
        onFolderSelected={folder => {
          setValue('folder_id', folder.id || null, {shouldDirty: true});
          setFolderName(folder.id ? folder.name : undefined);
        }}
      >
        <Dialog.Trigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start font-normal"
            />
          }
        >
          <FolderIcon />
          {folderName ?? <Trans message="Home" />}
          <ChevronDownIcon className="ml-auto" />
        </Dialog.Trigger>
      </SelectDestinationFolderDialog>
      <Field.Description>
        <Trans message="Uploaded files will be added to this folder in your drive." />
      </Field.Description>
      <Field.Error />
    </HookForm.Field>
  );
}

function DeadlineField({hasDeadline}: {hasDeadline: boolean}) {
  const {trans} = useTrans();
  const {setValue} = useFormContext<CrupdateFileRequestRequest>();
  const [isChecked, setIsChecked] = useState(hasDeadline);

  const handleCheckedChange = (checked: boolean) => {
    setIsChecked(checked);
    if (!checked) {
      setValue('deadline', null);
      setValue('allow_late_uploads', false);
    }
  };

  return (
    <div>
      <Field.Root>
        <Field.Label className="font-normal">
          <Switch checked={isChecked} onCheckedChange={handleCheckedChange} />
          <Trans message="Set a deadline" />
        </Field.Label>
      </Field.Root>
      {isChecked && (
        <>
          <FormDatePicker
            min={minDate}
            name="deadline"
            granularity="minute"
            size="sm"
            className="mt-3"
            aria-label={trans({message: 'File request deadline'})}
          />
          <HookForm.Field name="allow_late_uploads" className="mt-3">
            <Field.Label className="font-normal">
              <Switch />
              <Trans message="Keep accepting uploads after the deadline" />
            </Field.Label>
          </HookForm.Field>
        </>
      )}
    </div>
  );
}

function PasswordField({hasPassword}: {hasPassword: boolean}) {
  const {trans} = useTrans();
  const [isChecked, setIsChecked] = useState(hasPassword);

  return (
    <div>
      <Field.Root>
        <Field.Label className="font-normal">
          <Switch checked={isChecked} onCheckedChange={setIsChecked} />
          <Trans message="Password protect" />
        </Field.Label>
      </Field.Root>
      {isChecked && (
        <HookForm.Field name="password" className="mt-3">
          <Field.Label className="sr-only">
            <Trans message="File request password" />
          </Field.Label>
          <Input
            type="password"
            placeholder={trans({message: 'Enter new password...'})}
          />
          <Field.Description>
            <Trans message="Share this password separately, people will need it before they can upload." />
          </Field.Description>
          <Field.Error />
        </HookForm.Field>
      )}
    </div>
  );
}

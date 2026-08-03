import {sendFileRequestEmailOptions} from '@app/app-queries';
import {FileRequest} from '@app/gen/schemas/file-request';
import {SendFileRequestEmailBody} from '@app/gen/schemas/send-file-request-email-body';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {toast} from '@shadcn/toast/toast';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {Plus, XIcon} from 'lucide-react';
import {useFieldArray, useForm, useWatch} from 'react-hook-form';

interface Props {
  fileRequest: FileRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendFileRequestEmailDialog({
  fileRequest,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <SendFileRequestEmailDialogContent
          fileRequest={fileRequest}
          onSent={() => onOpenChange(false)}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SendFileRequestEmailDialogContent({
  fileRequest,
  onSent,
}: {
  fileRequest: FileRequest;
  onSent: () => void;
}) {
  const sendEmail = useMutation(sendFileRequestEmailOptions(fileRequest.id));
  const form = useForm<SendFileRequestEmailBody>({
    defaultValues: {
      emails: [{email: ''}],
    },
  });
  const {fields, append, remove} = useFieldArray({
    control: form.control,
    name: 'emails',
  });
  const emails = useWatch({control: form.control, name: 'emails'});

  const handleSubmit = async (values: SendFileRequestEmailBody) => {
    sendEmail.mutate(values, {
      onError: err => onFormQueryError(err, form),
      onSuccess: () => {
        toast.success(<Trans message="File request emails sent" />);
        onSent();
      },
    });
  };

  return (
    <HookForm.Root form={form} onSubmit={handleSubmit}>
      <Dialog.Content className="sm:max-w-lg">
        <Dialog.Header>
          <Dialog.Title>
            <Trans message="Send via email" />
          </Dialog.Title>
          <Dialog.Description>
            <Trans
              message='Send a link so people can upload files to ":title". Recipients do not need an account.'
              values={{title: fileRequest.title}}
            />
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Body>
          <Field.Group className="gap-3">
            {fields.map((field, index) => (
              <div className="flex w-full items-start" key={field.id}>
                <HookForm.Field
                  name={`emails.${index}.email`}
                  className="flex-1"
                >
                  <Field.Label className={index === 0 ? undefined : 'sr-only'}>
                    <Trans message="Email" />
                  </Field.Label>
                  <Input
                    type="email"
                    autoFocus={index === 0}
                    placeholder="example@gmail.com"
                  />
                  <Field.Error />
                </HookForm.Field>

                {fields.length > 1 ? (
                  <Tooltip.Root>
                    <Tooltip.Trigger>
                      <Button
                        className={cn(
                          'ml-1',
                          index === 0 ? 'mt-7.5' : 'mt-0.5',
                        )}
                        type="button"
                        variant="ghost"
                        color="default"
                        size="icon-sm"
                        onClick={() => remove(index)}
                      >
                        <XIcon />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <Trans message="Remove email" />
                    </Tooltip.Content>
                  </Tooltip.Root>
                ) : null}
              </div>
            ))}
          </Field.Group>

          <Button
            className="mt-3"
            type="button"
            variant="outline"
            color="default"
            size="sm"
            disabled={sendEmail.isPending || fields.length >= 10}
            onClick={() => append({email: ''})}
          >
            <Plus />
            <Trans message="Add email" />
          </Button>

          {fileRequest.has_password ? (
            <p className="mt-3 text-sm text-muted-foreground">
              <Trans message="This request is password protected, remember to share the password separately." />
            </p>
          ) : null}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseButton disabled={sendEmail.isPending}>
            <Trans message="Cancel" />
          </Dialog.CloseButton>
          <Button
            type="submit"
            disabled={
              sendEmail.isPending ||
              !form.formState.isDirty ||
              !emails?.length
            }
          >
            <Trans message="Send" />
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </HookForm.Root>
  );
}

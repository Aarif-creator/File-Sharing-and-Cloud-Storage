import {
  retrieveShareableLinkOptions,
  updateShareableLinkOptions,
} from '@app/app-queries';
import type {ShareDialogActivePanel} from '@app/drive/share-dialog/share-dialog';
import {CrupdateShareableLinkRequest} from '@app/gen/schemas/crupdate-shareable-link-request';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {getLocalTimeZone, now} from '@internationalized/date';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Switch} from '@shadcn/forms/switch/switch';
import {Separator} from '@shadcn/separator';
import {toast} from '@shadcn/toast/toast';
import {useMutation, useQuery} from '@tanstack/react-query';
import {FormDatePicker} from '@ui/forms/input-field/date/date-picker/date-picker';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {ArrowBackIcon} from '@ui/icons/material/ArrowBack';
import {useSettings} from '@ui/settings/use-settings';
import {cn} from '@ui/utils/cn';
import {XIcon} from 'lucide-react';
import {ReactElement, useId, useState} from 'react';
import {useForm} from 'react-hook-form';

interface LinkSettingsDialogProps {
  className?: string;
  setActivePanel: (name: ShareDialogActivePanel) => void;
  entry: DriveEntry;
}
export function LinkSettingsDialog({
  className,
  setActivePanel,
  entry,
}: LinkSettingsDialogProps) {
  const {drive} = useSettings();
  const enableDirectLinks = drive?.direct_links ?? false;
  const formId = useId();
  const {data} = useQuery(retrieveShareableLinkOptions(entry.id));
  const link = data?.data;
  const form = useForm<CrupdateShareableLinkRequest>({
    defaultValues: {
      allow_download: link?.allow_download ?? true,
      allow_edit: link?.allow_edit,
      allow_direct: link?.allow_direct ?? true,
      expires_at: link?.expires_at,
    },
  });

  const updateLink = useMutation(updateShareableLinkOptions(entry.id));
  const handleSubmit = (value: CrupdateShareableLinkRequest) => {
    updateLink.mutate(value, {
      onSuccess: () => {
        setActivePanel('main');
        toast.success(<Trans message="Link settings saved" />);
      },
      onError: err => onFormQueryError(err, form),
    });
  };

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>
          <Trans message="Shareable Link Settings" />
        </Dialog.Title>
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute inset-e-4 top-4"
          onClick={() => setActivePanel('main')}
        >
          <XIcon />
        </Button>
      </Dialog.Header>
      <Dialog.Body className="pb-2">
        <HookForm.Root
          id={formId}
          className={cn('flex flex-col gap-5', className)}
          form={form}
          onSubmit={handleSubmit}
        >
          <LinkExpirationOption isChecked={!!link?.expires_at} />
          <LinkPasswordOption isChecked={!!link?.has_password} />
          <LinkOption>
            <Trans message="Allow download" />
            <HookForm.Field name="allow_download">
              <Field.Label className="font-normal">
                <Switch />
                <Trans message="Users with link can download this item" />
              </Field.Label>
            </HookForm.Field>
          </LinkOption>
          <LinkOption showBorder={enableDirectLinks}>
            <Trans message="Allow import" />
            <HookForm.Field name="allow_edit">
              <Field.Label className="font-normal">
                <Switch />
                <Trans message="Users with link can import this item into their own drive" />
              </Field.Label>
            </HookForm.Field>
          </LinkOption>
          {enableDirectLinks && (
            <LinkOption showBorder={false}>
              <Trans message="Allow direct access" />
              <HookForm.Field name="allow_direct">
                <Field.Label className="font-normal">
                  <Switch />
                  <Trans message="Allow accessing contents of the file directly using this link" />
                </Field.Label>
              </HookForm.Field>
            </LinkOption>
          )}
        </HookForm.Root>
      </Dialog.Body>
      <Dialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setActivePanel('main');
          }}
        >
          <ArrowBackIcon />
          <Trans message="Back" />
        </Button>
        <Button type="submit" form={formId} disabled={updateLink.isPending}>
          <Trans message="Save" />
        </Button>
      </Dialog.Footer>
    </>
  );
}

const minDate = now(getLocalTimeZone());

interface LinkExpirationOptionProps {
  isChecked: boolean;
}
function LinkExpirationOption({
  isChecked: isCheckedDefault,
}: LinkExpirationOptionProps) {
  const {trans} = useTrans();
  const [isChecked, setIsChecked] = useState(isCheckedDefault);
  return (
    <LinkOption>
      <Trans message="Link expiration" />
      <div>
        <Field.Root>
          <Field.Label className="font-normal">
            <Switch
              checked={isChecked}
              onCheckedChange={checked => setIsChecked(checked)}
            />
            <Trans message="Link is valid until" />
          </Field.Label>
        </Field.Root>
        {isChecked && (
          <FormDatePicker
            min={minDate}
            name="expires_at"
            granularity="minute"
            size="sm"
            className="mt-5"
            aria-label={trans({
              message: 'Link expiration date and time',
            })}
          />
        )}
      </div>
    </LinkOption>
  );
}

interface LinkPasswordOptionProps {
  isChecked: boolean;
}
function LinkPasswordOption({
  isChecked: isCheckedDefault,
}: LinkPasswordOptionProps) {
  const {trans} = useTrans();
  const [isChecked, setIsChecked] = useState(isCheckedDefault);
  return (
    <LinkOption>
      <Trans message="Password protect" />
      <div>
        <Field.Root>
          <Field.Label className="font-normal">
            <Switch
              checked={isChecked}
              onCheckedChange={checked => setIsChecked(checked)}
            />
            <Trans message="Users will need to enter password in order to view this link" />
          </Field.Label>
        </Field.Root>
        {isChecked && (
          <HookForm.Field name="password" className="mt-5">
            <Field.Label className="sr-only">
              <Trans message="Link password" />
            </Field.Label>
            <Input
              type="password"
              autoFocus
              placeholder={trans({
                message: 'Enter new password...',
              })}
            />
            <Field.Description>
              <Trans message="Password will not be requested when viewing the link as file owner." />
            </Field.Description>
            <Field.Error />
          </HookForm.Field>
        )}
      </div>
    </LinkOption>
  );
}

interface LinkOptionProps {
  children: [ReactElement, ReactElement];
  showBorder?: boolean;
}
function LinkOption({children, showBorder = true}: LinkOptionProps) {
  const [title, content] = children;
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{title}</div>
      {content}
      {showBorder && <Separator className="mt-5" />}
    </div>
  );
}

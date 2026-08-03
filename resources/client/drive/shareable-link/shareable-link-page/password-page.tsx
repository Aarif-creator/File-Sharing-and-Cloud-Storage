import {linkPageState} from '@app/drive/shareable-link/shareable-link-page/link-page-store';
import {checkLinkPassword} from '@app/gen/links';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {Button} from '@shadcn/button/button';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {LockIcon} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {ShareableLinkNavbar} from './shareable-link-navbar';

type FormValue = {
  password: string;
};

export function PasswordPage() {
  const {hash} = useRequiredParams(['hash']);
  const linkHash = hash ? hash.split(':')[0] : null;
  const checkPassword = useMutation({
    mutationFn: (body: {password: string}) =>
      checkLinkPassword(linkHash!, body),
  });

  const form = useForm<FormValue>();

  const handleSubmit = (values: FormValue) => {
    checkPassword.mutate(values, {
      onSuccess: ({matches}) => {
        if (matches) {
          linkPageState().setPassword(form.getValues('password'));
        }
      },
      onError: err => onFormQueryError(err, form),
    });
  };

  return (
    <div className="flex h-screen w-full flex-col bg-muted">
      <ShareableLinkNavbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="m-3.5 max-w-140 rounded-card border bg-background p-6">
          <HookForm.Root
            className="flex flex-col gap-4"
            form={form}
            onSubmit={values => {
              handleSubmit(values);
            }}
          >
            <div className="flex items-center gap-2 text-sm">
              <LockIcon className="size-4" />
              <Trans message="The content you are trying to access is password protected." />
            </div>
            <HookForm.Field name="password">
              <Field.Label>
                <Trans message="Password" />
              </Field.Label>
              <Input autoFocus type="password" required />
              <Field.Error />
            </HookForm.Field>
            <div className="text-right">
              <Button
                variant="default"
                color="primary"
                type="submit"
                className="w-full md:w-auto"
                disabled={checkPassword.isPending}
              >
                <Trans message="Enter" />
              </Button>
            </div>
          </HookForm.Root>
        </div>
      </div>
    </div>
  );
}

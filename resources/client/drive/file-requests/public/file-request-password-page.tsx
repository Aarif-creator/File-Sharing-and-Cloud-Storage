import {checkFileRequestPassword} from '@app/gen/file-requests';
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

type FormValue = {
  password: string;
};

interface Props {
  onPasswordMatched: (password: string) => void;
}

export function FileRequestPasswordPage({onPasswordMatched}: Props) {
  const {hash} = useRequiredParams(['hash']);
  const form = useForm<FormValue>();
  const checkPassword = useMutation({
    mutationFn: (body: FormValue) => checkFileRequestPassword(hash, body),
  });

  const handleSubmit = (values: FormValue) => {
    checkPassword.mutate(values, {
      onSuccess: ({matches}) => {
        if (matches) {
          onPasswordMatched(values.password);
        }
      },
      onError: err => onFormQueryError(err, form),
    });
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="m-3.5 w-full max-w-140 rounded-card border bg-background p-6">
        <HookForm.Root
          className="flex flex-col gap-4"
          form={form}
          onSubmit={handleSubmit}
        >
          <div className="flex items-center gap-2 text-sm">
            <LockIcon className="size-4" />
            <Trans message="This file request is password protected." />
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
  );
}

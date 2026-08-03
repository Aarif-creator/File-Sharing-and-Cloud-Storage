import {driveBaseKey} from '@app/app-queries';
import {duplicateEntries} from '@app/gen/files';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {FirstParam} from '@ui/utils/ts/extract-params';
import {useId} from 'react';

export function useDuplicateEntries() {
  const toastId = useId();
  return useMutation({
    mutationFn: (payload: FirstParam<typeof duplicateEntries>) => {
      toast.loading(
        <Trans
          message="Duplicating [one 1 item|other :count items]..."
          values={{count: payload.entryIds.length}}
        />,
        {id: toastId},
      );
      return duplicateEntries({
        entryIds: payload.entryIds,
        destinationId: !payload.destinationId ? null : payload.destinationId,
      });
    },
    onSuccess: (r, p) => {
      queryClient.invalidateQueries({queryKey: driveBaseKey});
      toast.success(
        <Trans
          message="Duplicated [one 1 item|other :count items]"
          values={{count: p.entryIds.length}}
        />,
        {id: toastId},
      );
    },
    onError: err =>
      showHttpErrorToast(
        err,
        <Trans message="Could not duplicate items" />,
        null,
        {id: toastId},
      ),
  });
}

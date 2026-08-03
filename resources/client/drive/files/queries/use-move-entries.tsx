import {driveBaseKey} from '@app/app-queries';
import {RootFolderPage} from '@app/drive/drive-page/drive-page';
import {moveFileEntries} from '@app/gen/files';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {FirstParam} from '@ui/utils/ts/extract-params';
import {useId} from 'react';

export function useMoveEntries() {
  const toastId = useId();
  return useMutation({
    mutationFn: (payload: FirstParam<typeof moveFileEntries>) => {
      toast.loading(
        <Trans
          message="Moving [one 1 item|other :count items]..."
          values={{count: payload.entryIds.length}}
        />,
        {id: toastId},
      );
      return moveFileEntries({
        entryIds: payload.entryIds,
        // backend expects null for root folder, it might be zero or empty string on frontend
        destinationId: !payload.destinationId ? null : payload.destinationId,
      });
    },
    onSuccess: (r, p) => {
      queryClient.invalidateQueries({queryKey: driveBaseKey});
      toast.success(
        <Trans
          message='Moved [one 1 item|other :count items] to ":destination"'
          values={{
            count: p.entryIds.length,
            destination: (r.destination || RootFolderPage.folder).name,
          }}
        />,
        {id: toastId},
      );
    },
    onError: err =>
      showHttpErrorToast(err, <Trans message="Could not move items" />, null, {
        id: toastId,
      }),
  });
}

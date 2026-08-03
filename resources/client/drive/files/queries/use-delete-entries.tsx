import {driveBaseKey} from '@app/app-queries';
import {bulkDeleteFileEntries} from '@app/gen/files';
import {BulkDeleteFileEntriesBody} from '@app/gen/schemas/bulk-delete-file-entries-body';
import {getApiErrorMessage} from '@common/http/errors/parsed-api-error';
import {queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {ReactNode, useId} from 'react';

export function useDeleteEntries() {
  const toastId = useId();
  return useMutation({
    mutationFn: (payload: BulkDeleteFileEntriesBody) => {
      toast.loading(getLoaderMessage(payload), {id: toastId});
      return bulkDeleteFileEntries(payload);
    },
    onSuccess: (r, {entryIds, emptyTrash, deleteForever}) => {
      queryClient.invalidateQueries({queryKey: driveBaseKey});
      if (emptyTrash) {
        toast.success(<Trans message="Emptied trash" />, {id: toastId});
      } else if (deleteForever) {
        toast.success(
          <Trans
            message="Permanently deleted [one 1 item|other :count items]"
            values={{count: entryIds?.length ?? 0}}
          />,
          {id: toastId},
        );
      } else {
        toast.success(
          <Trans
            message="Moved [one 1 item|other :count items] to trash"
            values={{count: entryIds?.length ?? 0}}
          />,
          {id: toastId},
        );
      }
    },
    onError: (err, {emptyTrash}) => {
      const backendError = getApiErrorMessage(err);
      if (backendError) {
        toast.error(backendError, {id: toastId});
      } else if (emptyTrash) {
        toast.error(<Trans message="Could not empty trash" />, {id: toastId});
      } else {
        toast.error(<Trans message="Could not delete items" />, {id: toastId});
      }
    },
  });
}

function getLoaderMessage(payload: BulkDeleteFileEntriesBody): ReactNode {
  if (payload.emptyTrash) {
    return <Trans message="Emptying trash..." />;
  } else if (payload.deleteForever) {
    return <Trans message="Deleting files..." />;
  } else {
    return <Trans message="Moving to trash..." />;
  }
}

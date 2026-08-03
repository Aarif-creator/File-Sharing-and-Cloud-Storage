import {driveBaseKey} from '@app/app-queries';
import {restoreDeletedEntries} from '@app/gen/files';
import {RestoreDeletedEntriesBody} from '@app/gen/schemas/restore-deleted-entries-body';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';

export function useRestoreEntries() {
  return useMutation({
    mutationFn: (payload: RestoreDeletedEntriesBody) =>
      restoreDeletedEntries(payload),
    onSuccess: (r, p) => {
      queryClient.invalidateQueries({queryKey: driveBaseKey});
      toast.success(
        <Trans
          message="Restored [one 1 item|other :count items]"
          values={{count: p.entryIds.length}}
        />,
      );
    },
    onError: err =>
      showHttpErrorToast(err, <Trans message="Could not restore items" />),
  });
}

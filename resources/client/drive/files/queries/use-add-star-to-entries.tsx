import {driveBaseKey} from '@app/app-queries';
import {starEntries} from '@app/gen/files';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {FirstParam} from '@ui/utils/ts/extract-params';

export function useAddStarToEntries() {
  return useMutation({
    mutationFn: (body: FirstParam<typeof starEntries>) => starEntries(body),
    onSuccess: (response, body) => {
      queryClient.invalidateQueries({queryKey: driveBaseKey});
      toast.success(
        <Trans
          message="Starred [one 1 item|other :count items]"
          values={{
            count: body.entryIds.length,
          }}
        />,
      );
    },
    onError: err =>
      showHttpErrorToast(err, <Trans message="Could not star items" />),
  });
}

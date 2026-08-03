import {getUserSpaceUsage} from '@app/gen/files';
import {GetUserSpaceUsage200} from '@app/gen/schemas/get-user-space-usage200';
import {useQuery} from '@tanstack/react-query';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';

export function useStorageSummary() {
  return useQuery({
    queryKey: ['storage-summary'],
    queryFn: () => getUserSpaceUsage(),
    select: formatResponse,
  });
}

function formatResponse(response: GetUserSpaceUsage200) {
  // null means that user has unlimited space available
  const percentage =
    response.available === null
      ? 0
      : (response.used * 100) / response.available;

  return {
    usedFormatted: prettyBytes(response.used, 2),
    availableFormatted: prettyBytes(response.available ?? 0, 0),
    percentage,
    used: response.used,
    available: response.available,
  };
}

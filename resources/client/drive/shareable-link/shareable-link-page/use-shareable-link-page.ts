import {defaultSortDescriptor} from '@app/drive/layout/sorting/available-sorts';
import {
  linkPageState,
  useLinkPageStore,
} from '@app/drive/shareable-link/shareable-link-page/link-page-store';
import {getShareableLinkPageData} from '@app/gen/links';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {
  keepPreviousData,
  partialMatchKey,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';

export function useShareableLinkPage() {
  const {hash} = useRequiredParams(['hash']);

  const sortDescriptor = useLinkPageStore(s => s.activeSort);
  const sortKey = `${sortDescriptor.orderBy}:${sortDescriptor.orderDir}`;

  const isPasswordProtected = useLinkPageStore(s => s.isPasswordProtected);
  const password = useLinkPageStore(s => s.password);

  const queryKey = buildQueryKey(hash!, sortKey, password);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam = 1}) => {
      const response = await getShareableLinkPageData(hash, {
        page: `${pageParam}`,
        password,
        sort: sortKey,
      });

      if (response.password_invalid) {
        linkPageState().setIsPasswordProtected(true);
      }

      return response;
    },
    initialData: () => {
      const data = getBootstrapData().loaders?.shareableLinkPage;

      if (data?.password_invalid) {
        linkPageState().setIsPasswordProtected(true);
      }

      if (!data?.data) return undefined;

      const queryKeyMatches = partialMatchKey(
        queryKey,
        buildQueryKey(
          data.data.hash,
          `${defaultSortDescriptor.orderBy}:${defaultSortDescriptor.orderDir}`,
          password,
        ),
      );

      if (queryKeyMatches) {
        return {
          pageParams: [undefined, 1],
          pages: [data],
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: lastResponse => {
      if (!lastResponse.folderChildren) return undefined;
      const currentPage = lastResponse.folderChildren.current_page;
      if (!lastResponse.folderChildren.next_page_url) {
        return undefined;
      }
      return currentPage + 1;
    },
    // disable query if link is password protected and correct
    // password was not entered yet, to prevent unnecessary requests
    enabled: (!!hash && !isPasswordProtected) || password != null,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    link: query.data?.pages[0].data,
    entries: query.data?.pages
      .flatMap(p => p.folderChildren?.data)
      .filter(e => !!e),
  };
}

const buildQueryKey = (
  hash: string,
  sortKey: string,
  password: string | null,
) => ['shareable-link-page', hash, sortKey, password];

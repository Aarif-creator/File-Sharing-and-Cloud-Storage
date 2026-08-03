import {listEntriesBaseKey} from '@app/app-queries';
import {makeFolderPage, SearchPage} from '@app/drive/drive-page/drive-page';
import {driveState, useDriveStore} from '@app/drive/drive-store';
import {driveSearchFilters} from '@app/drive/search/drive-search-filters';
import {listDriveEntries} from '@app/gen/files';
import {ListDriveEntriesParams} from '@app/gen/schemas/list-drive-entries-params';
import {ListDriveEntries200} from '@app/gen/schemas/list-drive-entries200';
import {getNextPageParam} from '@common/http/backend-response/pagination-response';
import {InfiniteData, useInfiniteQuery} from '@tanstack/react-query';
import {shallowEqual} from '@ui/utils/shallow-equal';
import {useEffect, useMemo} from 'react';
import {useSearchParams} from 'react-router';

const setActiveFolder = (response: InfiniteData<ListDriveEntries200>) => {
  const firstPage = response.pages[0];
  const newFolder = firstPage.folder;
  const currentPage = driveState().activePage;

  if (
    newFolder &&
    currentPage &&
    currentPage.uniqueId === newFolder.hash &&
    // only update page if once to set the folder or if permissions change, to keep page reference as stable as possible
    (!currentPage.folder ||
      !shallowEqual(newFolder.permissions, currentPage.folder?.permissions))
  ) {
    driveState().setActivePage(makeFolderPage(newFolder));
  }
  return response;
};

export function useActivePageEntries() {
  const page = useDriveStore(s => s.activePage);
  const sortDescriptor = useDriveStore(s => s.sortDescriptor);
  const [searchParams] = useSearchParams();
  const queryParamsObj = Object.fromEntries(searchParams);
  const params: ListDriveEntriesParams = {
    section: page?.name ?? 'home',
    ...page?.queryParams,
    ...queryParamsObj,
    folder_id: page?.isFolderPage ? page.uniqueId : null,
    sort: `${sortDescriptor.orderBy}:${sortDescriptor.orderDir}`,
  };

  // if we have no search query, there's no need to call the API, show no results message instead
  const availableFilters = driveSearchFilters.map(f => f.key);
  const isDisabledInSearch =
    page === SearchPage &&
    !params.query &&
    !availableFilters.some(f => queryParamsObj[f]);

  const query = useInfiniteQuery({
    enabled: page != null && !isDisabledInSearch,
    staleTime: Infinity,
    queryKey: [...listEntriesBaseKey, params],
    queryFn: ({pageParam = 1, signal}) =>
      listDriveEntries(
        {
          ...params,
          page: Number(pageParam),
        },
        {signal},
      ),
    initialPageParam: 1,
    getNextPageParam,
  });

  // need to do this in effect, to avoid react errors about
  // multiple components re-rendering at the same time
  useEffect(() => {
    if (query.data?.pages[0].folder) {
      setActiveFolder(query.data);
    }
  }, [query.data]);

  const items = useMemo(() => {
    return query.data?.pages.flatMap(p => p.data) || [];
  }, [query.data?.pages]);

  return {
    ...query,
    items,
    isEmpty: !items.length,
  };
}

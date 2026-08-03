import {listEntriesBaseKey} from '@app/app-queries';
import {listDriveEntries} from '@app/gen/files';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {ListDriveEntriesParams} from '@app/gen/schemas/list-drive-entries-params';
import {getNextPageParam} from '@common/http/backend-response/pagination-response';
import {InfiniteScrollSentinel} from '@common/ui/infinite-scroll/infinite-scroll-sentinel';
import {Empty} from '@shadcn/empty/empty';
import {Spinner} from '@shadcn/spinner/spinner';
import {useInfiniteQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {ChevronRightIcon, FolderIcon} from 'lucide-react';
import {ReactElement, useMemo} from 'react';

interface Props {
  selectedFolder: DriveEntry;
  onFolderSelected: (folder: DriveEntry) => void;
  movingSharedFiles: boolean;
}
export function MoveEntriesDialogFolderList({
  onFolderSelected,
  selectedFolder,
  movingSharedFiles,
}: Props) {
  const query = useFolders({
    selectedFolder,
    movingSharedFiles,
  });
  let content: ReactElement;

  if (query.isLoading) {
    content = (
      <div className="flex size-full items-center justify-center">
        <Spinner />
      </div>
    );
  } else if (query.data?.pages[0]?.data.length === 0) {
    content = (
      <Empty className="py-16">
        <Empty.Header>
          <Empty.Media variant="icon">
            <FolderIcon />
          </Empty.Media>
          <Empty.Description className="text-foreground">
            <Trans
              message={`There are no subfolders in ":folder"`}
              values={{folder: selectedFolder.name}}
            />
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  } else {
    content = (
      <>
        <ul>
          {query.data?.pages
            .flatMap(r => r.data)
            .map(folder => (
              <li key={folder.id}>
                <button
                  type="button"
                  onClick={() => onFolderSelected(folder)}
                  className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 border-b px-3 py-2 text-sm outline-hidden select-none hover:bg-accent"
                >
                  <FolderIcon className="size-4 shrink-0" />
                  <span className="mr-auto min-w-0 truncate">
                    {folder.name}
                  </span>
                  <ChevronRightIcon className="size-4 shrink-0" />
                </button>
              </li>
            ))}
        </ul>
        <InfiniteScrollSentinel query={query} />
      </>
    );
  }

  return (
    <div className="compact-scrollbar h-72 overflow-y-auto">{content}</div>
  );
}

function useFolders({
  selectedFolder,
  movingSharedFiles,
}: {
  selectedFolder: DriveEntry;
  movingSharedFiles: boolean;
}) {
  const params: ListDriveEntriesParams = useMemo(() => {
    return {
      section: 'folder',
      folder_id:
        selectedFolder.hash == '0' && movingSharedFiles
          ? 'shared_with_me'
          : selectedFolder.hash,
      type: 'folder',
    };
  }, [selectedFolder.hash, movingSharedFiles]);

  return useInfiniteQuery({
    queryKey: [...listEntriesBaseKey, params],
    queryFn: ({pageParam = 1, signal}) =>
      listDriveEntries(
        {
          ...params,
          page: pageParam as number,
        },
        {signal},
      ),
    initialPageParam: 1,
    getNextPageParam,
  });
}

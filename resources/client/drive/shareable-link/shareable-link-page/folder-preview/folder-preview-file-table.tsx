import {fileTableColumns} from '@app/drive/file-view/file-table/file-table-columns';
import {DriveSortDescriptor} from '@app/drive/layout/sorting/available-sorts';
import type {FolderPreviewGridProps} from '@app/drive/shareable-link/shareable-link-page/folder-preview/folder-preview-file-grid';
import {
  linkPageState,
  useLinkPageStore,
} from '@app/drive/shareable-link/shareable-link-page/link-page-store';
import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {FileThumbnail} from '@common/uploads/components/file-type-icon/file-thumbnail';
import {Item} from '@shadcn/item/item';
import {GenericTable} from '@shadcn/table/generic-table';
import {useTable} from '@shadcn/table/utils/use-table';
import {FormattedBytes} from '@ui/i18n/formatted-bytes';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {useMemo} from 'react';

export function FolderPreviewFileTable({
  entries,
  onEntrySelected,
}: FolderPreviewGridProps) {
  const isMobile = useIsMobileMediaQuery();

  if (isMobile) {
    return <MobileList entries={entries} onEntrySelected={onEntrySelected} />;
  }

  return <DesktopTable entries={entries} onEntrySelected={onEntrySelected} />;
}

function DesktopTable({entries, onEntrySelected}: FolderPreviewGridProps) {
  const sortDescriptor = useLinkPageStore(s => s.activeSort);

  const columns = useMemo(() => {
    return fileTableColumns.filter(column => column.id !== 'actions');
  }, []);

  const table = useTable({
    data: entries,
    columns,
    enableRowSelection: false,
    sort: sortDescriptor as SortDescriptor,
    onSortChange: value => {
      if (value?.orderBy) {
        linkPageState().setActiveSort(value as DriveSortDescriptor);
      }
    },
  });

  return (
    <GenericTable
      table={table}
      onRowClick={row => {
        onEntrySelected(row.original, row.index);
      }}
    />
  );
}

function MobileList({entries, onEntrySelected}: FolderPreviewGridProps) {
  return (
    <Item.Group className="gap-0">
      {entries.map((entry, index) => (
        <Item.Root
          key={entry.id}
          size="xs"
          variant="outline"
          onClick={() => onEntrySelected(entry, index)}
        >
          <Item.Media variant="default" align="center">
            <FileThumbnail
              className="size-6 rounded-sm"
              iconClassName="size-6"
              file={entry}
            />
          </Item.Media>
          <Item.Content>
            <Item.Title className="font-normal">{entry.name}</Item.Title>
            <Item.Description className="flex items-center gap-1 text-xs">
              <FormattedDate date={entry.updated_at} />
              {entry.file_size && (
                <>
                  <span>·</span>
                  <FormattedBytes bytes={entry.file_size} />
                </>
              )}
            </Item.Description>
          </Item.Content>
        </Item.Root>
      ))}
    </Item.Group>
  );
}

import {EntryActionMenuTrigger} from '@app/drive/entry-actions/entry-action-menu-trigger';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {FileThumbnail} from '@common/uploads/components/file-type-icon/file-thumbnail';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {SortableHeader} from '@shadcn/table/utils/sortable-header';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedBytes} from '@ui/i18n/formatted-bytes';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {EllipsisVerticalIcon} from 'lucide-react';

export const fileTableColumns: ColumnDef<DriveEntry>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Name" />
      </SortableHeader>
    ),
    cell: ({row}) => {
      const entry = row.original;
      return (
        <div className="flex min-w-0 items-center gap-3.5">
          <FileThumbnail
            className="size-6 rounded-sm"
            iconClassName="size-6"
            file={entry}
          />
          <div className="truncate">{entry.name}</div>
        </div>
      );
    },
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    enableSorting: true,
    size: 180,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Last modified" />
      </SortableHeader>
    ),
    cell: ({row}) => <FormattedDate date={row.original.updated_at} />,
  },
  {
    id: 'file_size',
    accessorKey: 'file_size',
    enableSorting: true,
    size: 120,
    header: ({column}) => (
      <SortableHeader column={column}>
        <Trans message="Size" />
      </SortableHeader>
    ),
    cell: ({row}) =>
      row.original.file_size != null ? (
        <FormattedBytes bytes={row.original.file_size} />
      ) : (
        '-'
      ),
  },
  {
    id: 'actions',
    size: 1,
    enableSorting: false,
    header: () => (
      <span className="sr-only">
        <Trans message="Actions" />
      </span>
    ),
    cell: ({row}) => {
      const entry = row.original;
      return (
        <EntryActionMenuTrigger entries={[entry]}>
          <Dropdown.Trigger
            render={
              <Button size="icon" variant="ghost">
                <EllipsisVerticalIcon />
              </Button>
            }
          />
        </EntryActionMenuTrigger>
      );
    },
  },
];

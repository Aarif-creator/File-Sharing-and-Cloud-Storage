import {driveState, useDriveStore} from '@app/drive/drive-store';
import {fileTableColumns} from '@app/drive/file-view/file-table/file-table-columns';
import {FileTableMobile} from '@app/drive/file-view/file-table/file-table-mobile';
import {useFileViewDnd} from '@app/drive/file-view/use-file-view-dnd';
import {useViewItemActionHandler} from '@app/drive/file-view/use-view-item-action-handler';
import {DriveSortDescriptor} from '@app/drive/layout/sorting/available-sorts';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {SortDescriptor} from '@common/ui/tables/types/sort-descriptor';
import {mergeProps} from '@react-aria/utils';
import {Table} from '@shadcn/table/table';
import {useTable} from '@shadcn/table/utils/use-table';
import {flexRender, Row} from '@tanstack/react-table';
import {usePointerEvents} from '@ui/interactions/use-pointer-events';
import {cn} from '@ui/utils/cn';
import {ignoreEventsFromPortal} from '@ui/utils/dom/ignore-events-from-portal';
import {isCtrlOrShiftPressed} from '@ui/utils/keybinds/is-ctrl-or-shift-pressed';
import {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  use,
  useMemo,
} from 'react';

interface Props {
  entries: DriveEntry[];
}

export function FileTable({entries}: Props) {
  const {isMobileMode} = use(DashboardLayoutContext);

  if (isMobileMode) {
    return <FileTableMobile entries={entries} />;
  }

  return <FileTableDesktop entries={entries} />;
}

function FileTableDesktop({entries}: Props) {
  const {performViewItemAction} = useViewItemActionHandler();
  const selectedEntries = useDriveStore(s => s.selectedEntries);
  const sortDescriptor = useDriveStore(s => s.sortDescriptor);

  const selectedRows = useMemo(() => [...selectedEntries], [selectedEntries]);

  const table = useTable({
    data: entries,
    columns: fileTableColumns,
    enableRowSelection: true,
    sort: sortDescriptor as SortDescriptor,
    onSortChange: value => {
      if (value?.orderBy) {
        driveState().setSortDescriptor(value as DriveSortDescriptor);
      }
    },
    selectedRows,
    onSelectedRowsChange: rows => {
      driveState().selectEntries(rows);
    },
  });

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row className="hover:bg-transparent">
          {table.getFlatHeaders().map(header => (
            <Table.Head
              key={header.id}
              style={
                {
                  '--width':
                    header.column.columnDef.size === 1
                      ? '1%'
                      : header.column.columnDef.size
                        ? `${header.column.columnDef.size}px`
                        : undefined,
                } as CSSProperties
              }
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map(row => (
          <FileTableRow
            key={row.id}
            row={row}
            onAction={() => performViewItemAction(row.original)}
          />
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function FileTableRow({
  row,
  onAction,
}: {
  row: Row<DriveEntry>;
  onAction: () => void;
}) {
  const entry = row.original;
  const {draggableProps, droppableProps, itemClassName, ref} =
    useFileViewDnd<HTMLTableRowElement>(entry);

  const {domProps: pressProps} = usePointerEvents({
    onPress: e => {
      if (
        (e.target as HTMLElement).closest('button, a, input, select, textarea')
      ) {
        return;
      }
      if (isCtrlOrShiftPressed(e)) {
        if (driveState().selectedEntries.has(entry.id)) {
          driveState().deselectEntries([entry.id]);
        } else {
          driveState().selectEntries([entry.id], true);
        }
      } else {
        driveState().selectEntries([entry.id]);
      }
    },
  });

  const handleDoubleClick: MouseEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    onAction();
  };

  const handleContextMenu: MouseEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!driveState().selectedEntries.has(entry.id)) {
      driveState().selectEntries([entry.id]);
    }
    driveState().setContextMenuData({x: e.clientX, y: e.clientY});
  };

  const handleKeyDown: KeyboardEventHandler = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onAction();
    }
  };

  return (
    <Table.Row
      ref={ref}
      tabIndex={-1}
      className={cn(
        'cursor-pointer',
        itemClassName,
        row.getIsSelected() && 'bg-primary/5 hover:bg-primary/10',
      )}
      onDoubleClick={ignoreEventsFromPortal(handleDoubleClick)}
      onContextMenu={ignoreEventsFromPortal(handleContextMenu)}
      onKeyDown={ignoreEventsFromPortal(handleKeyDown)}
      {...mergeProps(draggableProps, droppableProps, pressProps)}
    >
      {row.getVisibleCells().map(cell => (
        <Table.Cell key={cell.id} className="px-3 py-1.5">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </Table.Cell>
      ))}
    </Table.Row>
  );
}

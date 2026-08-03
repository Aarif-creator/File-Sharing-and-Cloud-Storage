import {driveState, useDriveStore} from '@app/drive/drive-store';
import {EntryActionMenuTrigger} from '@app/drive/entry-actions/entry-action-menu-trigger';
import {BaseFileGridItem} from '@app/drive/file-view/file-grid/base-file-grid-item';
import {useFileViewDnd} from '@app/drive/file-view/use-file-view-dnd';
import {useViewItemActionHandler} from '@app/drive/file-view/use-view-item-action-handler';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {mergeProps} from '@react-aria/utils';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Checkbox} from '@shadcn/forms/checkbox/checkbox';
import {usePointerEvents} from '@ui/interactions/use-pointer-events';
import {ignoreEventsFromPortal} from '@ui/utils/dom/ignore-events-from-portal';
import {isCtrlOrShiftPressed} from '@ui/utils/keybinds/is-ctrl-or-shift-pressed';
import {MoreVerticalIcon} from 'lucide-react';
import React, {useContext} from 'react';

interface FileGridItemProps {
  entry: DriveEntry;
}
export function FileGridItem({entry}: FileGridItemProps) {
  const isSelected = useDriveStore(s => s.selectedEntries.has(entry.id));
  const {performViewItemAction} = useViewItemActionHandler();
  const {isMobileMode} = useContext(DashboardLayoutContext);

  const {draggableProps, droppableProps, itemClassName, ref} =
    useFileViewDnd<HTMLDivElement>(entry);

  const toggleEntry = () => {
    if (isSelected) {
      driveState().deselectEntries([entry.id]);
    } else {
      driveState().selectEntries([entry.id], true);
    }
  };

  const pressHandler = (e: PointerEvent) => {
    if (isMobileMode) {
      if (driveState().selectedEntries.size) {
        toggleEntry();
      } else {
        performViewItemAction(entry);
      }
    } else {
      if (isCtrlOrShiftPressed(e)) {
        toggleEntry();
      } else {
        driveState().selectEntries([entry.id]);
      }
    }
  };

  const {domProps: pressProps} = usePointerEvents({
    onLongPress: isMobileMode ? () => toggleEntry() : undefined,
    onPress: pressHandler,
  });

  const keyboardHandler: React.KeyboardEventHandler = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      performViewItemAction(entry);
    }
  };

  const contextMenuHandler: React.MouseEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMobileMode) {
      if (!driveState().selectedEntries.has(entry.id)) {
        driveState().selectEntries([entry.id]);
      }
      driveState().setContextMenuData({x: e.clientX, y: e.clientY});
    }
  };

  return (
    <BaseFileGridItem
      {...mergeProps(draggableProps, droppableProps, pressProps, {
        onKeyDown: ignoreEventsFromPortal(keyboardHandler),
      })}
      ref={ref}
      entry={entry}
      isSelected={isSelected}
      isMobileMode={!!isMobileMode}
      tabIndex={-1}
      onDoubleClick={e => {
        e.preventDefault();
        e.stopPropagation();
        if (!isMobileMode) {
          performViewItemAction(entry);
        }
      }}
      footerAdornment={
        isMobileMode && (
          <FooterAdornment entry={entry} isSelected={isSelected} />
        )
      }
      onContextMenu={ignoreEventsFromPortal(contextMenuHandler)}
      className={itemClassName}
    />
  );
}

interface FooterProps {
  entry: DriveEntry;
  isSelected?: boolean;
}
function FooterAdornment({entry, isSelected}: FooterProps) {
  const anySelected = useDriveStore(s => s.selectedEntries.size);

  if (anySelected) {
    return (
      <Checkbox className="pointer-events-none mr-3" checked={isSelected} />
    );
  }

  return (
    <EntryActionMenuTrigger entries={[entry]}>
      <Dropdown.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onPointerDown={e => {
              e.stopPropagation();
            }}
          >
            <MoreVerticalIcon />
          </Button>
        }
      />
    </EntryActionMenuTrigger>
  );
}

import {TrashPage} from '@app/drive/drive-page/drive-page';
import {driveState, useDriveStore} from '@app/drive/drive-store';
import {
  folderAcceptsDrop,
  useFolderDropAction,
} from '@app/drive/files/use-folder-drop-action';
import {getSelectedEntries} from '@app/drive/files/use-selected-entries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {useMouseSelectable} from '@ui/interactions/dnd/mouse-selection/use-mouse-selectable';
import {
  ConnectedDraggable,
  useDraggable,
} from '@ui/interactions/dnd/use-draggable';
import {useDroppable} from '@ui/interactions/dnd/use-droppable';
import {useIsTouchDevice} from '@ui/utils/hooks/is-touch-device';
import clsx from 'clsx';
import {useRef, useState} from 'react';

export function useFileViewDnd<T extends HTMLElement = HTMLElement>(
  destination: DriveEntry,
) {
  const isTouchDevice = useIsTouchDevice();
  const ref = useRef<T>(null);
  const {onDrop} = useFolderDropAction(destination);
  const [isDragOver, setIsDragOver] = useState(false);
  const isDragging = useDriveStore(s =>
    s.entriesBeingDragged.includes(destination.id),
  );
  const activePage = useDriveStore(s => s.activePage);

  const {draggableProps} = useDraggable({
    disabled: !!isTouchDevice || activePage === TrashPage,
    id: destination.id,
    type: 'fileEntry',
    ref,
    hidePreview: true,
    onDragStart: (e, target: ConnectedDraggable<DriveEntry[]>) => {
      if (!driveState().selectedEntries.has(destination.id)) {
        driveState().selectEntries([destination.id]);
      }
      driveState().setEntriesBeingDragged(target.getData().map(e => e.id));
    },
    onDragEnd: () => {
      driveState().setEntriesBeingDragged([]);
    },
    getData: () => getSelectedEntries(),
  });

  const {droppableProps} = useDroppable<T>({
    id: destination.id,
    disabled: isTouchDevice || destination.type !== 'folder',
    ref,
    types: ['fileEntry', 'nativeFile'],
    acceptsDrop: target => folderAcceptsDrop(target, destination as DriveEntry),
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    onDrop,
  });

  useMouseSelectable({
    id: destination.id,
    ref,
    onSelected: () => {
      driveState().selectEntries([destination.id], true);
    },
    onDeselected: () => {
      driveState().deselectEntries([destination.id]);
    },
  });

  const itemClassName = clsx(
    isDragging && 'opacity-20',
    isDragOver && 'bg-primary/5 ring ring-primary ring-offset-4',
  );

  return {
    draggableProps,
    droppableProps,
    isDragOver,
    isDragging,
    itemClassName,
    ref,
  };
}

import {driveState, useDriveStore} from '@app/drive/drive-store';
import {EntryActionMenuTrigger} from '@app/drive/entry-actions/entry-action-menu-trigger';
import {useFileViewDnd} from '@app/drive/file-view/use-file-view-dnd';
import {useViewItemActionHandler} from '@app/drive/file-view/use-view-item-action-handler';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {FileThumbnail} from '@common/uploads/components/file-type-icon/file-thumbnail';
import {mergeProps} from '@react-aria/utils';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Checkbox} from '@shadcn/forms/checkbox/checkbox';
import {Item} from '@shadcn/item/item';
import {FormattedBytes} from '@ui/i18n/formatted-bytes';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {usePointerEvents} from '@ui/interactions/use-pointer-events';
import {cn} from '@ui/utils/cn';
import {EllipsisVerticalIcon} from 'lucide-react';

interface Props {
  entries: DriveEntry[];
}

export function FileTableMobile({entries}: Props) {
  return (
    <Item.Group
      className="select-none"
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {entries.map(entry => (
        <FileTableMobileItem key={entry.id} entry={entry} />
      ))}
    </Item.Group>
  );
}

function FileTableMobileItem({entry}: {entry: DriveEntry}) {
  const isSelected = useDriveStore(s => s.selectedEntries.has(entry.id));
  const {performViewItemAction} = useViewItemActionHandler();
  const {draggableProps, droppableProps, itemClassName, ref} =
    useFileViewDnd<HTMLDivElement>(entry);

  const toggleEntry = () => {
    if (isSelected) {
      driveState().deselectEntries([entry.id]);
    } else {
      driveState().selectEntries([entry.id], true);
    }
  };

  const {domProps: pressProps} = usePointerEvents({
    onLongPress: () => toggleEntry(),
    onPress: () => {
      if (driveState().selectedEntries.size) {
        toggleEntry();
      } else {
        performViewItemAction(entry);
      }
    },
  });

  return (
    <Item.Root
      ref={ref}
      size="xs"
      variant="outline"
      className={cn(isSelected && 'bg-primary/5', itemClassName, 'gap-4')}
      {...mergeProps(draggableProps, droppableProps, pressProps)}
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
      <Item.Actions
        onPointerDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
        {isSelected ? (
          <Checkbox
            checked={isSelected}
            className="pointer-events-none mr-2.5"
          />
        ) : (
          <EntryActionMenuTrigger entries={[entry]}>
            <Dropdown.Trigger
              render={
                <Button variant="ghost" size="icon">
                  <EllipsisVerticalIcon />
                </Button>
              }
            />
          </EntryActionMenuTrigger>
        )}
      </Item.Actions>
    </Item.Root>
  );
}

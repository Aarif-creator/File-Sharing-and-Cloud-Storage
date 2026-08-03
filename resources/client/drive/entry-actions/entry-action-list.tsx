import {EntryAction} from '@app/drive/entry-actions/entry-action';
import {EntryActionMenuTrigger} from '@app/drive/entry-actions/entry-action-menu-trigger';
import {
  useDeleteEntriesAction,
  usePreviewAction,
  useRemoveSharedEntriesAction,
  useShareAction,
} from '@app/drive/entry-actions/use-entry-actions';
import {useSelectedEntries} from '@app/drive/files/use-selected-entries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {MoreVerticalIcon} from 'lucide-react';

interface EntryActionListProps {
  className?: string;
}
export function EntryActionList({className}: EntryActionListProps) {
  const selectedEntries = useSelectedEntries();

  if (!selectedEntries.length) {
    return null;
  }

  return (
    <div className={className}>
      <ActionList entries={selectedEntries} />
    </div>
  );
}

interface ActionListProps {
  entries: DriveEntry[];
}
function ActionList({entries}: ActionListProps) {
  const preview = usePreviewAction(entries);
  const share = useShareAction(entries);
  const deleteAction = useDeleteEntriesAction(entries);
  const removeShared = useRemoveSharedEntriesAction(entries);

  const actions = [preview, share, deleteAction, removeShared].filter(
    action => !!action,
  ) as EntryAction[];

  return (
    <div
      className="entry-action-list flex gap-2"
      onContextMenu={e => e.stopPropagation()}
    >
      {actions.map(action => (
        <Tooltip.Root key={action.key}>
          <Tooltip.Trigger
            render={
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  action.execute();
                }}
              />
            }
          >
            {action.icon}
          </Tooltip.Trigger>
          <Tooltip.Content>{action.label}</Tooltip.Content>
        </Tooltip.Root>
      ))}
      <Tooltip.Root>
        <EntryActionMenuTrigger entries={entries}>
          <Dropdown.Trigger
            render={
              <Tooltip.Trigger
                render={<Button variant="outline" size="icon" />}
              />
            }
          >
            <MoreVerticalIcon />
          </Dropdown.Trigger>
        </EntryActionMenuTrigger>
        <Tooltip.Content>
          <Trans message="More actions" />
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}

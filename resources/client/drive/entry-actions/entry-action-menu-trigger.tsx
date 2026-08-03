import {
  DrivePage,
  RootFolderPage,
  TrashPage,
} from '@app/drive/drive-page/drive-page';
import {EntryAction} from '@app/drive/entry-actions/entry-action';
import {useDrivePageActions} from '@app/drive/entry-actions/use-drive-page-actions';
import {useEntryActions} from '@app/drive/entry-actions/use-entry-actions';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {ReactElement} from 'react';

interface Props {
  children: ReactElement;
  entries?: DriveEntry[];
  page?: DrivePage;
  showIfNoActions?: boolean;
}
export function EntryActionMenuTrigger({
  children,
  entries,
  page,
  showIfNoActions,
}: Props) {
  if (page?.name === RootFolderPage.name) {
    return (
      <PageMenu page={RootFolderPage} showIfNoActions={showIfNoActions}>
        {children}
      </PageMenu>
    );
  }

  if (page === TrashPage) {
    return (
      <PageMenu page={TrashPage} showIfNoActions={showIfNoActions}>
        {children}
      </PageMenu>
    );
  }

  if (page?.folder) {
    return (
      <EntriesMenu entries={[page.folder]} showIfNoActions={showIfNoActions}>
        {children}
      </EntriesMenu>
    );
  }

  if (entries?.length) {
    return (
      <EntriesMenu entries={entries} showIfNoActions={showIfNoActions}>
        {children}
      </EntriesMenu>
    );
  }

  return null;
}

interface EntriesContextMenuProps extends Omit<BaseMenuProps, 'actions'> {
  entries: DriveEntry[];
}
function EntriesMenu({
  entries,
  children,
  showIfNoActions,
}: EntriesContextMenuProps) {
  const actions = useEntryActions(entries);
  return (
    <BaseMenu actions={actions} showIfNoActions={showIfNoActions}>
      {children}
    </BaseMenu>
  );
}

interface PageContextMenuProps extends Omit<BaseMenuProps, 'actions'> {
  page: DrivePage;
  showIfNoActions?: boolean;
}
function PageMenu({page, children, showIfNoActions}: PageContextMenuProps) {
  const actions = useDrivePageActions(page);
  return (
    <BaseMenu actions={actions} showIfNoActions={showIfNoActions}>
      {children}
    </BaseMenu>
  );
}

interface BaseMenuProps {
  actions: EntryAction[];
  children: ReactElement;
  showIfNoActions?: boolean;
}
function BaseMenu({actions, children, showIfNoActions}: BaseMenuProps) {
  if (!actions.length && !showIfNoActions) {
    return null;
  }
  return (
    <Dropdown.Root>
      {children}
      <Dropdown.Content>
        {actions.map(action => (
          <Dropdown.Item
            key={action.key}
            onClick={() => {
              action.execute();
            }}
          >
            {action.icon}
            {action.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

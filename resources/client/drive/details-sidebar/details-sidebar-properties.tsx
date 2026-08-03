import {listWorkspaceFoldersOptions} from '@app/app-queries';
import {DetailsSidebarHeader} from '@app/drive/details-sidebar/details-sidebar-header';
import {DetailsSidebarSectionHeader} from '@app/drive/details-sidebar/details-sidebar-section-header';
import {DetailsSidebarTags} from '@app/drive/details-sidebar/details-sidebar-tags';
import {
  getPathForFolder,
  RootFolderPage,
} from '@app/drive/drive-page/drive-page';
import {driveState} from '@app/drive/drive-store';
import {useSelectedEntries} from '@app/drive/files/use-selected-entries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {FileThumbnail} from '@common/uploads/components/file-type-icon/file-thumbnail';
import {Avatar} from '@shadcn/avatar/avatar';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@ui/buttons/button';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {FolderIcon} from '@ui/icons/material/Folder';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';
import {UsersIcon} from 'lucide-react';
import {ReactNode, useMemo} from 'react';

interface EntryPropertiesProps {
  entry: DriveEntry;
}
export function DetailsSidebarProperties({entry}: EntryPropertiesProps) {
  return (
    <div>
      <DetailsSidebarHeader entryType={entry.type} entryName={entry.name} />
      {entry.type === 'image' && (
        <FileThumbnail
          className="mb-5 overflow-hidden rounded-card border border-border/80"
          file={entry}
        />
      )}
      <div>
        <DetailsSidebarSectionHeader>
          <Trans message="Who has access" />
        </DetailsSidebarSectionHeader>
        <div className="flex items-center gap-2">
          {entry.workspace_id ? (
            <div className="flex size-8 items-center justify-center rounded-full border">
              <UsersIcon className="size-4" />
            </div>
          ) : null}
          {entry.users?.length ? (
            <Avatar.Group>
              {entry.users.map(user => (
                <Tooltip.Root key={user.id}>
                  <Tooltip.Trigger render={<Avatar />}>
                    <Avatar.Image src={user.image} />
                    <Avatar.ColorFallback>{user.name}</Avatar.ColorFallback>
                  </Tooltip.Trigger>
                  <Tooltip.Content>{user.name}</Tooltip.Content>
                </Tooltip.Root>
              ))}
            </Avatar.Group>
          ) : null}
        </div>
        {entry.permissions?.['files.update'] && (
          <Button
            className="mt-5 block"
            variant="outline"
            size="xs"
            color="primary"
            onClick={() => {
              driveState().setActiveActionDialog('share', [entry]);
            }}
          >
            <Trans message="Manage Access" />
          </Button>
        )}
      </div>
      <PropertyList entry={entry} />
      <DetailsSidebarTags entry={entry} />
    </div>
  );
}

interface Props {
  entry: DriveEntry;
}
function PropertyList({entry}: Props) {
  const parent = useSelectedEntryParent();
  const navigate = useNavigate();
  const owner = entry.users?.find(user => user.owns_entry);
  const prettySize = useMemo(
    () => prettyBytes(entry.file_size),
    [entry.file_size],
  );

  return (
    <div className="mt-5 border-t pt-5">
      <DetailsSidebarSectionHeader>
        <Trans message="Properties" />
      </DetailsSidebarSectionHeader>
      {entry.type ? (
        <PropertyItem
          label={<Trans message="Type" />}
          value={
            <span className="capitalize">
              <Trans message={entry.type} />
            </span>
          }
        />
      ) : null}
      <PropertyItem
        label={<Trans message="Size" />}
        value={entry.file_size ? prettySize : '-'}
      />
      <PropertyItem
        label={<Trans message="Location" />}
        value={
          <Button
            variant="link"
            startIcon={<FolderIcon />}
            onClick={() => {
              navigate(
                parent ? getPathForFolder(parent.hash) : RootFolderPage.path,
              );
            }}
          >
            {parent ? parent.name : <Trans message="Root" />}
          </Button>
        }
      />
      {owner && (
        <PropertyItem label={<Trans message="Owner" />} value={owner.name} />
      )}
      <PropertyItem
        label={<Trans message="Modified" />}
        value={<FormattedDate date={entry.updated_at} />}
      />
      <PropertyItem
        label={<Trans message="Created" />}
        value={<FormattedDate date={entry.created_at} />}
      />
    </div>
  );
}

interface PropertyItemProps {
  label: ReactNode;
  value: ReactNode;
}
function PropertyItem({label, value}: PropertyItemProps) {
  return (
    <div className="mb-3.5 flex items-center">
      <div className="w-1/3 text-xs text-muted-foreground">{label}</div>
      <div className="w-2/3 text-sm text-foreground">{value}</div>
    </div>
  );
}

function useSelectedEntryParent(): DriveEntry | null | undefined {
  const entry = useSelectedEntries()[0];
  const {data} = useQuery(listWorkspaceFoldersOptions());
  if (!entry || !data?.data) return;
  return data.data.find(e => e.id === entry.parent_id) as DriveEntry;
}

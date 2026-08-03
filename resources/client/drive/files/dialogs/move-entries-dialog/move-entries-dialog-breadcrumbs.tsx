import {getFolderPathOptions} from '@app/app-queries';
import {RootFolderPage} from '@app/drive/drive-page/drive-page';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {Button} from '@shadcn/button/button';
import {useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {ArrowLeftIcon, FolderIcon} from 'lucide-react';

interface FolderBreadCrumbsProps {
  selectedFolder: DriveEntry;
  onFolderSelected: (folder: DriveEntry) => void;
}
export function MoveEntriesDialogBreadcrumbs({
  selectedFolder,
  onFolderSelected,
}: FolderBreadCrumbsProps) {
  const {data} = useQuery({
    ...getFolderPathOptions(selectedFolder.hash),
    enabled: selectedFolder.hash !== RootFolderPage.folder.hash,
  });

  let previous: DriveEntry | null = null;
  if (data?.data) {
    if (data.data.length === 1) {
      previous = RootFolderPage.folder;
    } else {
      previous = data.data[data.data.length - 2];
    }
  }

  const items = [RootFolderPage.folder, ...(data?.data ?? [])];

  return (
    <div className="flex items-center gap-3 border-b pb-2.5">
      <Button
        variant="outline"
        size="icon-xs"
        disabled={!previous}
        onClick={() => {
          if (previous) {
            onFolderSelected(previous);
          }
        }}
      >
        <ArrowLeftIcon />
      </Button>
      <Breadcrumb.Root className="flex-auto">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = item.id || 'root';
          const nodes = [];

          if (index > 0) {
            nodes.push(<Breadcrumb.Separator key={`sep-${key}`} />);
          }

          const label = (
            <>
              {!item.id && <FolderIcon className="size-4 shrink-0" />}
              {item.id ? (
                item.name
              ) : (
                <Trans message={RootFolderPage.folder.name} />
              )}
            </>
          );

          nodes.push(
            <Breadcrumb.Item key={key}>
              {isLast ? (
                <Breadcrumb.Page className="flex items-center gap-2">
                  {label}
                </Breadcrumb.Page>
              ) : (
                <Breadcrumb.Button
                  className="flex items-center gap-2"
                  onClick={() => onFolderSelected(item)}
                >
                  {label}
                </Breadcrumb.Button>
              )}
            </Breadcrumb.Item>,
          );

          return nodes;
        })}
      </Breadcrumb.Root>
    </div>
  );
}

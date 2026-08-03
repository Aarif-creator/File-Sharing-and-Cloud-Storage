import {getFolderPathOptions} from '@app/app-queries';
import {
  DrivePage,
  makeFolderPage,
  RootFolderPage,
  SharesPage,
  TrashPage,
} from '@app/drive/drive-page/drive-page';
import {useDriveStore} from '@app/drive/drive-store';
import {EntryActionMenuTrigger} from '@app/drive/entry-actions/entry-action-menu-trigger';
import {useAuth} from '@common/auth/use-auth';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {useWorkspaceStore} from '@common/workspace/workspace-store';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {useQuery} from '@tanstack/react-query';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {MixedText} from '@ui/i18n/mixed-text';
import {cn} from '@ui/utils/cn';
import {ChevronDownIcon} from 'lucide-react';
import {ReactNode, useContext} from 'react';

interface ItemConfig {
  page: DrivePage;
  label: MessageDescriptor | string;
}

interface PageBreadcrumbsProps {
  className?: string;
}
export function PageBreadcrumbs({className}: PageBreadcrumbsProps) {
  const {isMobileMode} = useContext(DashboardLayoutContext);
  const page = useDriveStore(s => s.activePage);
  const folder = page?.folder;
  const query = useQuery({
    ...getFolderPathOptions(folder?.hash ?? ''),
    enabled: !!folder?.hash && folder?.hash !== RootFolderPage.folder.hash,
  });
  const workspace = useWorkspaceStore(s => s.activeWorkspace);
  const rootItem = useRootItem();
  // wait until path, folder and workspace load fully
  const isLoading =
    !page ||
    !workspace ||
    (page.isFolderPage && !folder) ||
    query.fetchStatus !== 'idle';

  let content: ReactNode;

  if (isLoading) {
    content = <div className={className} />;
  } else {
    const items: ItemConfig[] = rootItem ? [rootItem] : [];

    if (query.data) {
      query.data.data.forEach(parent => {
        items.push({
          page: makeFolderPage(parent),
          label: parent.name,
        });
      });
    }

    content = (
      <Breadcrumb.Root
        className={cn(
          isMobileMode ? 'text-base font-medium' : 'text-lg',
          className,
        )}
        onContextMenu={e => e.stopPropagation()}
      >
        {items.flatMap((item, index) => {
          const isLast = index === items.length - 1;
          const nodes = [];

          if (index > 0) {
            nodes.push(
              <Breadcrumb.Separator key={`sep-${item.page.uniqueId}`} />,
            );
          }

          nodes.push(
            <Breadcrumb.Item key={item.page.uniqueId}>
              {isLast ? (
                <LastBreadcrumbItem item={item} />
              ) : (
                <Breadcrumb.Link to={item.page.path}>
                  <Label>{item.label}</Label>
                </Breadcrumb.Link>
              )}
            </Breadcrumb.Item>,
          );

          return nodes;
        })}
      </Breadcrumb.Root>
    );
  }

  return content;
}

function LastBreadcrumbItem({item}: {item: ItemConfig}) {
  if (!item.page.folder && item.page !== TrashPage) {
    return (
      <Breadcrumb.Page>
        <Label>{item.label}</Label>
      </Breadcrumb.Page>
    );
  }

  return (
    <EntryActionMenuTrigger page={item.page} showIfNoActions>
      <Dropdown.Trigger
        render={
          <Breadcrumb.Button className="text-foreground hover:text-primary data-pressed:text-primary" />
        }
      >
        <Label>{item.label}</Label>
        <ChevronDownIcon />
      </Dropdown.Trigger>
    </EntryActionMenuTrigger>
  );
}

function Label({children}: {children: ItemConfig['label']}) {
  return (
    <span className="max-w-56 truncate">
      <MixedText value={children} />
    </span>
  );
}

function useRootItem(): ItemConfig | null {
  const page = useDriveStore(s => s.activePage);
  const workspace = useWorkspaceStore(s => s.activeWorkspace);
  const {user} = useAuth();

  if (!page) return null;

  // in workspace
  if (workspace && !workspace.is_personal) {
    if (
      page?.isFolderPage &&
      (page?.name === RootFolderPage.name ||
        page.folder?.workspace_id === workspace.id)
    ) {
      return {label: RootFolderPage.label, page: RootFolderPage};
    }
  }

  if (page?.isFolderPage) {
    const owner = page.folder?.users?.find(u => u.owns_entry);
    // inside shared folder
    if (owner?.id !== user?.id) {
      return {label: SharesPage.label, page: SharesPage};
    }
    // if folder is currently active, root item will always be root folder page
    return {label: RootFolderPage.label, page: RootFolderPage};
  }

  // if folder page is not active, we are already at the root
  return {label: page.label, page};
}

import {RootFolderPage} from '@app/drive/drive-page/drive-page';
import {useDeleteEntries} from '@app/drive/files/queries/use-delete-entries';
import {driveSidebarIcons} from '@app/drive/layout/sidebar/drive-sidebar-icons';
import {FolderTree} from '@app/drive/layout/sidebar/folder-tree';
import {MenuPositions} from '@app/drive/menu-positions';
import {FileEntry} from '@app/gen/schemas/file-entry';
import {MenuItemIcon} from '@common/menus/custom-menu';
import {MenuItemConfig} from '@common/menus/menu-config';
import {useCustomMenu} from '@common/menus/use-custom-menu';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {Sidebar} from '@common/ui/dashboard/sidebar';
import {useDroppable} from '@common/ui/library/interactions/dnd/use-droppable';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {HomeIcon} from 'lucide-react';
import {use, useRef, useState} from 'react';
import {NavLink} from 'react-router';

export function SidebarMenu() {
  const menuConfig = useCustomMenu(MenuPositions.DriveSidebar);
  const {leftSidebar} = use(DashboardLayoutContext);
  const isCollapsed = leftSidebar.status === 'collapsed';

  return (
    <Sidebar.Group>
      <Sidebar.GroupContent>
        {!isCollapsed && <FolderTree />}
        <Sidebar.Menu>
          {isCollapsed && (
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                render={<NavLink to={RootFolderPage.path} end />}
                icon={<HomeIcon />}
              >
                {RootFolderPage.folder.name}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          )}
          {menuConfig?.items.map(item => {
            if (item.action === '/drive/trash') {
              return <TrashMenuItem key={item.id} item={item} />;
            }
            return (
              <Sidebar.MenuItem key={item.id}>
                <Sidebar.MenuButton
                  render={<NavLink to={item.action} />}
                  icon={
                    <MenuItemIcon
                      item={item}
                      defaultIcons={driveSidebarIcons}
                    />
                  }
                >
                  <Trans message={item.label} />
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            );
          })}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
}

interface TrashMenuItemProps {
  item: MenuItemConfig;
}
function TrashMenuItem({item}: TrashMenuItemProps) {
  const deleteEntries = useDeleteEntries();
  const [isDragOver, setIsDragOver] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  const {droppableProps} = useDroppable({
    id: 'trash',
    types: ['fileEntry'],
    ref,
    onDragEnter: () => {
      setIsDragOver(true);
    },
    onDragLeave: () => {
      setIsDragOver(false);
    },
    onDrop: draggable => {
      const entryIds = (draggable.getData() as FileEntry[]).map(e => e.id);
      deleteEntries.mutate({entryIds, deleteForever: false});
    },
  });

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        className={cn(isDragOver && 'bg-sidebar-accent')}
        render={<NavLink to={item.action} ref={ref} {...droppableProps} />}
        icon={<MenuItemIcon item={item} defaultIcons={driveSidebarIcons} />}
      >
        <Trans message={item.label} />
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
}

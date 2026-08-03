import {driveState, useDriveStore} from '@app/drive/drive-store';
import {EntryActionList} from '@app/drive/entry-actions/entry-action-list';
import {EntryDragPreview} from '@app/drive/file-view/entry-drag-preview';
import {DriveDialogsContainer} from '@app/drive/files/dialogs/drive-dialogs-container';
import {CreateNewButton} from '@app/drive/layout/create-new-button';
import {DriveSidebar} from '@app/drive/layout/sidebar/drive-sidebar';
import {driveSidebarIcons} from '@app/drive/layout/sidebar/drive-sidebar-icons';
import {NavbarSearch} from '@app/drive/search/navbar-search';
import {UploadQueue} from '@app/drive/uploading/upload-queue';
import {UnstyledCustomMenuItem} from '@common/menus/custom-menu';
import {useCustomMenu} from '@common/menus/use-custom-menu';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {FileEntryUrlsContext} from '@common/uploads/file-entry-urls';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {FileUploadStoreOptions} from '@common/uploads/uploader/file-upload-store';
import {WorkspaceSelector} from '@common/workspace/workspace-selector';
import {useWorkspaceStore} from '@common/workspace/workspace-store';
import {cn} from '@ui/utils/cn';
import {useMediaQuery} from '@ui/utils/hooks/use-media-query';
import {MenuIcon} from 'lucide-react';
import {use, useMemo} from 'react';
import {Outlet, useLocation} from 'react-router';

const uploadStoreOptions: FileUploadStoreOptions = {
  modifyUploadedFile: uploadedFile => {
    const workspaceId = useWorkspaceStore.getState().activeWorkspace?.id;
    uploadedFile.fingerprint = `${uploadedFile.fingerprint}-w-${workspaceId}`;
    return uploadedFile;
  },
};

export function Component() {
  const activeWorkspace = useWorkspaceStore(s => s.activeWorkspace);
  const activePage = useDriveStore(s => s.activePage);
  const isCompactLayout = useMediaQuery('(max-width: 1024px)');

  const urlsContextValue = useMemo(() => {
    return activeWorkspace ? {workspaceId: activeWorkspace.id} : {};
  }, [activeWorkspace]);

  return (
    <FileUploadProvider options={uploadStoreOptions}>
      <FileEntryUrlsContext.Provider value={urlsContextValue}>
        <DashboardLayout.Root
          className="bg-muted"
          name="drive"
          defaultRightSidebarStatus="collapsed"
          onDragOver={e => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'none';
          }}
          onDrop={e => {
            // prevent files from desktop from blowing away the document
            e.preventDefault();
          }}
        >
          {isCompactLayout ? <MobileNavbar /> : <DriveNavbar />}
          <DashboardLayout.Content
            className={cn(
              isCompactLayout &&
                'overflow-hidden rounded-t-card bg-background shadow',
            )}
          >
            <DriveSidebar />
            <Outlet />
          </DashboardLayout.Content>
          {isCompactLayout ? <MobileFooter /> : null}
          <UploadQueue />
          <DriveDialogsContainer />
          {isCompactLayout && <FloatingActionList />}
        </DashboardLayout.Root>
      </FileEntryUrlsContext.Provider>
      <EntryDragPreview />
    </FileUploadProvider>
  );
}

function DriveNavbar() {
  const {leftSidebar} = use(DashboardLayoutContext);

  return (
    <DashboardLayout.Navbar>
      <Navbar.Logo />
      <NavbarSearch />
      <Navbar.Content>
        {leftSidebar.status === 'collapsed' && <WorkspaceSelector />}
      </Navbar.Content>
      <Navbar.Content className="ml-auto">
        <Navbar.Menu position="drive-navbar" />
        <Navbar.AuthContent />
      </Navbar.Content>
    </DashboardLayout.Navbar>
  );
}

function MobileNavbar() {
  return (
    <DashboardLayout.Navbar className="py-2">
      <DashboardLayout.SidebarToggle>
        <MenuIcon />
      </DashboardLayout.SidebarToggle>
      <Navbar.Logo logoType="compact" />
      <Navbar.Content className="ml-auto">
        <CreateNewButton isCompact />
        <Navbar.Menu position="drive-navbar" />
        <Navbar.AuthContent />
      </Navbar.Content>
    </DashboardLayout.Navbar>
  );
}

function FloatingActionList() {
  const entriesSelected = useDriveStore(s => s.selectedEntries.size);
  if (!entriesSelected) return null;

  return (
    <DashboardLayout.FloatingActions
      selectedItemsCount={entriesSelected}
      onClear={() => driveState().selectEntries([])}
    >
      <EntryActionList />
    </DashboardLayout.FloatingActions>
  );
}

export function MobileFooter() {
  const menu = useCustomMenu('drive-mobile');
  const {pathname} = useLocation();
  if (!menu) return null;

  return (
    <div className="bottom-navbar flex items-center justify-between gap-7.5 border-t bg-background px-6 py-3">
      {menu.items.map(item => (
        <UnstyledCustomMenuItem
          key={item.id}
          item={item}
          defaultIcons={driveSidebarIcons}
          className={({isActive}) => {
            if (item.action === '/drive') {
              isActive =
                pathname === item.action ||
                pathname.startsWith('/drive/folders');
            }
            return cn(
              "flex flex-col items-center gap-1.5 overflow-hidden text-xs whitespace-nowrap [&_svg:not([class*='size-'])]:size-5",
              isActive && 'font-bold',
            );
          }}
        />
      ))}
    </div>
  );
}

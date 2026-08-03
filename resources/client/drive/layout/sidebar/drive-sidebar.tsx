import {RootFolderPage} from '@app/drive/drive-page/drive-page';
import {CreateNewButton} from '@app/drive/layout/create-new-button';
import {SidebarMenu} from '@app/drive/layout/sidebar/sidebar-menu';
import {CompactStorageTrigger} from '@app/drive/layout/sidebar/storage-summary/compact-storage-trigger';
import {StorageMeter} from '@app/drive/layout/sidebar/storage-summary/storage-meter';
import {UpgradeButton} from '@app/drive/layout/sidebar/upgrade-button';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {Sidebar} from '@common/ui/dashboard/sidebar';
import {Logo} from '@common/ui/navigation/navbar/logo';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {WorkspaceSelector} from '@common/workspace/workspace-selector';
import {useWorkspaceStore} from '@common/workspace/workspace-store';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {use, useEffect, useRef} from 'react';

export function DriveSidebar() {
  const {isMobileMode, leftSidebar} = use(DashboardLayoutContext);
  const {billing} = useSettings();
  const isCollapsed = leftSidebar.status === 'collapsed';

  return (
    <Sidebar.Root
      collapsible="icon"
      side="left"
      variant="inset"
      width="w-57"
      className="data-[variant=floating]:bg-background/50 dark:data-[variant=floating]:bg-card"
    >
      {isMobileMode && (
        <Sidebar.Header>
          <Sidebar.Item>
            <Logo logoType="wide" color="auto" className="max-w-40" />
          </Sidebar.Item>
        </Sidebar.Header>
      )}
      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupContent>
            <CreateNewButton isCompact={isCollapsed} />
          </Sidebar.GroupContent>
        </Sidebar.Group>
        <SidebarMenu />
        <Sidebar.Group>
          <Sidebar.GroupContent>
            {!isCollapsed && (
              <>
                <Sidebar.Item>
                  <StorageMeter />
                </Sidebar.Item>
                {billing?.enable ? (
                  <Sidebar.Item>
                    <UpgradeButton size="sm">
                      <Trans message="Upgrade" />
                    </UpgradeButton>
                  </Sidebar.Item>
                ) : null}
              </>
            )}
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
      <Sidebar.Footer>
        {isCollapsed ? (
          <CompactStorageTrigger className="mx-auto mb-2.5 shrink-0" />
        ) : (
          <WorkspaceSwitcher />
        )}
      </Sidebar.Footer>
    </Sidebar.Root>
  );
}

function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const activeWorkspace = useWorkspaceStore(s => s.activeWorkspace);
  const prevWorkspaceId = useRef(activeWorkspace?.id);

  useEffect(() => {
    if (
      prevWorkspaceId.current != null &&
      activeWorkspace?.id != null &&
      prevWorkspaceId.current !== activeWorkspace.id
    ) {
      navigate(RootFolderPage.path);
    }
    prevWorkspaceId.current = activeWorkspace?.id;
  }, [activeWorkspace?.id, navigate]);

  return <WorkspaceSelector />;
}

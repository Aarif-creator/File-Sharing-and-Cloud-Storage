import {driveState, useDriveStore} from '@app/drive/drive-store';
import {DriveSortButton} from '@app/drive/layout/sorting/drive-sort-button';
import {PageBreadcrumbs} from '@app/drive/page-breadcrumbs';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {Button} from '@shadcn/button/button';
import {Toggle} from '@shadcn/toggle';
import {ToggleGroup} from '@shadcn/toggle-group/toggle-group';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {Trans} from '@ui/i18n/trans';
import {InfoIcon, LayoutGridIcon, LayoutListIcon} from 'lucide-react';
import {use} from 'react';

export function DriveContentHeader() {
  const {isMobileMode} = use(DashboardLayoutContext);
  const activePage = useDriveStore(s => s.activePage);
  return (
    <DashboardLayout.SectionHeader>
      {!isMobileMode && <DashboardLayout.SidebarToggle />}
      {isMobileMode ? (
        <DriveSortButton isDisabled={activePage?.disableSort} />
      ) : (
        <PageBreadcrumbs />
      )}
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <ToggleViewModeButton />
        <ToggleDetailsButton />
      </div>
    </DashboardLayout.SectionHeader>
  );
}

function ToggleViewModeButton() {
  const viewMode = useDriveStore(s => s.viewMode);
  return (
    <ToggleGroup
      variant="segmented"
      buttonVariant="ghost"
      value={[viewMode]}
      onValueChange={value => driveState().setViewMode(value[0] as any)}
    >
      <Toggle value="list">
        <LayoutListIcon />
      </Toggle>
      <Toggle value="grid">
        <LayoutGridIcon />
      </Toggle>
    </ToggleGroup>
  );
}

function ToggleDetailsButton() {
  const {rightSidebar} = use(DashboardLayoutContext);
  const isOpen = rightSidebar.status === 'expanded';
  const tooltip = isOpen ? (
    <Trans message="Hide details" />
  ) : (
    <Trans message="Show details" />
  );
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            color={isOpen ? 'primary' : 'default'}
            onClick={() => {
              rightSidebar.setStatus(isOpen ? 'collapsed' : 'expanded');
            }}
          />
        }
      >
        <InfoIcon />
      </Tooltip.Trigger>
      <Tooltip.Content>{tooltip}</Tooltip.Content>
    </Tooltip.Root>
  );
}

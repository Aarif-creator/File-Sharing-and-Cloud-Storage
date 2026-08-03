import {DetailsSidebarHeader} from '@app/drive/details-sidebar/details-sidebar-header';
import {DetailsSidebarProperties} from '@app/drive/details-sidebar/details-sidebar-properties';
import {useSelectedEntries} from '@app/drive/files/use-selected-entries';
import {Sidebar} from '@common/ui/dashboard/sidebar';
import {Empty} from '@shadcn/empty/empty';
import {Trans} from '@ui/i18n/trans';
import {InfoIcon} from 'lucide-react';
import {Fragment} from 'react';

export function DetailsSidebar() {
  const selectedEntry = useSelectedEntries()[0];

  return (
    <Sidebar.Root
      side="right"
      variant="floating"
      collapsible="offcanvas"
      width="w-80"
    >
      <Sidebar.Content className="p-4.5">
        {selectedEntry ? (
          <>
            <DetailsSidebarProperties entry={selectedEntry} />
          </>
        ) : (
          <NothingSelected />
        )}
      </Sidebar.Content>
    </Sidebar.Root>
  );
}

function NothingSelected() {
  return (
    <Fragment>
      <DetailsSidebarHeader
        entryType="folder"
        entryName={<Trans message="All files" />}
      />
      <Empty className="mt-10 p-0">
        <Empty.Header>
          <Empty.Media variant="icon">
            <InfoIcon />
          </Empty.Media>
          <Empty.Description>
            <Trans message="Select file or folder to see details" />
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </Fragment>
  );
}

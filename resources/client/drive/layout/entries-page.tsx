import {DetailsSidebar} from '@app/drive/details-sidebar/details-sidebar';
import {
  DRIVE_PAGES,
  makePartialFolderPage,
} from '@app/drive/drive-page/drive-page';
import {driveState, useDriveStore} from '@app/drive/drive-store';
import {FileView} from '@app/drive/file-view/file-view';
import {DriveContentHeader} from '@app/drive/layout/drive-content-header';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {Trans} from '@ui/i18n/trans';
import {useEffect} from 'react';
import {useLocation, useParams} from 'react-router';

export function Component() {
  const {pathname} = useLocation();
  const {hash} = useParams();
  const activePage = useDriveStore(s => s.activePage);

  useEffect(() => {
    driveState().setActivePage(
      DRIVE_PAGES.find(p => p.path === pathname) ||
        makePartialFolderPage(hash!),
    );
  }, [pathname, hash]);

  useEffect(
    () => () => {
      driveState().reset();
    },
    [],
  );

  return (
    <>
      {activePage?.label && (
        <StaticPageTitle>
          <Trans
            message={
              typeof activePage.label === 'string'
                ? activePage.label
                : activePage.label.message
            }
          />
        </StaticPageTitle>
      )}
      <DashboardLayout.MainSection className="gap-(--section-spacing)">
        <DriveContentHeader />
        <FileView className="min-h-0 flex-1" />
      </DashboardLayout.MainSection>
      <DetailsSidebar />
    </>
  );
}

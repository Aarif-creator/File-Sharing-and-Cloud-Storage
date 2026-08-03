import {landingPageDataOptions} from '@app/app-queries';
import {DemoLoginPanel} from '@app/auth/demo-login-panel';
import {LandingPage as CommonLandingPage} from '@common/ui/landing-page/landing-page';
import {LandingPageContext} from '@common/ui/landing-page/landing-page-context';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useSettings} from '@ui/settings/use-settings';
import {
  ClapperboardIcon,
  CodeIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  RefreshCwIcon,
  SearchIcon,
  Share2Icon,
  UploadIcon,
  UsersIcon,
} from 'lucide-react';

const defaultIcons = {
  fileUpload: <UploadIcon />,
  dashboard: <LayoutDashboardIcon />,
  lock: <LockIcon />,
  sync: <RefreshCwIcon />,
  search: <SearchIcon />,
  code: <CodeIcon />,
  email: <MailIcon />,
  share: <Share2Icon />,
  link: <LinkIcon />,
  groups: <UsersIcon />,
  videoLibrary: <ClapperboardIcon />,
  pictureAsPdf: <FileTextIcon />,
};

export function Component() {
  const query = useSuspenseQuery(landingPageDataOptions());
  const {site} = useSettings();
  return (
    <LandingPageContext.Provider
      value={{
        defaultIcons,
        sections: query.data?.sections ?? [],
        adSlotAfterHero: 'landing-top',
      }}
    >
      <CommonLandingPage>
        {site?.demo ? <DemoLoginPanel /> : null}
      </CommonLandingPage>
    </LandingPageContext.Provider>
  );
}

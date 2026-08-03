import {SettingsNavItem} from '@common/admin/settings/settings-nav-config';
import {message} from '@ui/i18n/message';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {
  ChartColumnBigIcon,
  CircleDollarSignIcon,
  ClipboardClockIcon,
  FilesIcon,
  GlobeIcon,
  NotebookTextIcon,
  SettingsIcon,
  SquareStackIcon,
  TagsIcon,
  UserIcon,
  UserRoundKeyIcon,
} from 'lucide-react';
import {ReactElement} from 'react';

// icons
export const AdminSidebarIcons: Record<string, ReactElement<SvgIconProps>> = {
  '/admin/reports': <ChartColumnBigIcon />,
  '/admin/settings': <SettingsIcon />,
  '/admin/settings/general': <SettingsIcon />,
  '/admin/subscriptions': <CircleDollarSignIcon />,
  '/admin/plans': <SquareStackIcon />,
  '/admin/users': <UserIcon />,
  '/admin/roles': <UserRoundKeyIcon />,
  '/admin/custom-pages': <NotebookTextIcon />,
  '/admin/tags': <TagsIcon />,
  '/admin/files': <FilesIcon />,
  '/admin/localizations': <GlobeIcon />,
  '/admin/logs': <ClipboardClockIcon />,
};

// settings nav config
export const AppSettingsNavConfig: SettingsNavItem[] = [
  {label: message('Drive'), to: 'drive', position: 2},
  {label: message('Uploading'), to: 'uploading', position: 2},
  {label: message('Landing page'), to: 'landing-page', position: 2},
  {label: message('Ads'), to: 'ads', position: 9},
];

// docs urls
const base = 'https://support.vebto.com/hc/articles';
export const AdminDocsUrls = {
  manualUpdate: `${base}/21/23/295/updating-to-new-versions#method-2-manual-update`,
  settings: {
    uploading: `${base}/21/79/297/configuring-file-upload`,
    s3: `${base}/21/25/216/storing-files-on-amazon-s3`,
    dropbox: `${base}/21/25/215/storing-files-on-dropbox`,
    backblaze: `${base}/21/25/217/storing-files-on-backblaze`,
    authentication: `${base}/21/25/274/authentication-settings`,
  } as any,
  pages: {
    roles: `${base}/21/47/154/roles-and-permissions`,
    translations: `${base}/21/25/296/language-and-translation`,
  } as any,
};

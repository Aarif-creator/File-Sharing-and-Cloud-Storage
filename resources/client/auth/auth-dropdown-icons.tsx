import { SvgIconProps } from '@ui/icons/svg-icon';
import { FolderInputIcon, SettingsIcon, UserPenIcon } from 'lucide-react';
import { ReactElement } from 'react';

export const authDropdownIcons: Record<string, ReactElement<SvgIconProps>> = {
  '/admin/reports': <SettingsIcon />,
  '/account-settings': <UserPenIcon />,
  '/drive': <FolderInputIcon />,
};

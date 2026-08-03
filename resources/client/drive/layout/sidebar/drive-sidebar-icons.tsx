import {
  HistoryIcon,
  HomeIcon,
  InboxIcon,
  StarIcon,
  TrashIcon,
  UsersIcon,
} from 'lucide-react';
import {ReactElement} from 'react';

export const driveSidebarIcons: Record<string, ReactElement> = {
  '/drive': <HomeIcon />,
  '/drive/recent': <HistoryIcon />,
  '/drive/starred': <StarIcon />,
  '/drive/shares': <UsersIcon />,
  '/drive/file-requests': <InboxIcon />,
  '/drive/trash': <TrashIcon />,
};

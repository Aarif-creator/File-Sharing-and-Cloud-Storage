import {
  defaultSortDescriptor,
  DriveSortDescriptor,
} from '@app/drive/layout/sorting/available-sorts';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {BootstrapData} from '@ui/bootstrap-data/bootstrap-data';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {message} from '@ui/i18n/message';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';
import {Trans} from '@ui/i18n/trans';
import {
  HistoryIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  UploadIcon,
  UsersIcon,
} from 'lucide-react';
import {ReactNode} from 'react';

interface NoContentMessage {
  title: ReactNode;
  description: ReactNode;
  icon: ReactNode;
}

export interface DrivePage {
  uniqueId: string;
  name: string;
  label: MessageDescriptor | string;
  path: string;
  hasActions?: boolean;
  canUpload?: boolean;
  disableSort?: boolean;
  sortDescriptor: DriveSortDescriptor;
  queryParams?: Record<string, string | number | boolean>;
  folder?: DriveEntry;
  isFolderPage?: boolean;
  noContentMessage: (isSearchingOrFiltering: boolean) => NoContentMessage;
}

export function makeFolderPage(folder: DriveEntry): DrivePage {
  return {
    ...makePartialFolderPage(folder.hash),
    canUpload:
      folder.permissions['files.create'] || folder.permissions['files.update'],
    label: folder.name,
    folder,
  };
}

export function makePartialFolderPage(hash: string): DrivePage {
  return {
    name: 'folder',
    uniqueId: hash,
    label: '',
    path: getPathForFolder(hash),
    hasActions: true,
    canUpload: false,
    sortDescriptor: defaultSortDescriptor,
    isFolderPage: true,
    noContentMessage: () => ({
      title: <Trans message="Drop files or folders here" />,
      description: <Trans message='Or use the "Upload" button' />,
      icon: <UploadIcon />,
    }),
  };
}

export function getPathForFolder(hash: string): string {
  if (hash === '0') {
    return '/drive';
  }
  return `/drive/folders/${hash}`;
}

// bootstrap data will always be available at this point
interface BootstrapDataWithRootFolder extends BootstrapData {
  rootFolder?: DriveEntry;
}
const rootFolder = (getBootstrapData() as BootstrapDataWithRootFolder)
  .rootFolder;
export const RootFolderPage = {
  ...(rootFolder ? makeFolderPage(rootFolder) : {}),
  name: 'home',
} as Required<DrivePage>;

export const RecentPage: DrivePage = {
  name: 'recent',
  uniqueId: 'recent',
  label: message('Recent'),
  path: '/drive/recent',
  disableSort: true,
  sortDescriptor: {
    orderBy: 'created_at',
    orderDir: 'desc',
  },
  queryParams: {
    recentOnly: true,
  },
  noContentMessage: () => ({
    title: <Trans message="No recent entries" />,
    description: (
      <Trans message="You have not uploaded any files or folders yet" />
    ),
    icon: <HistoryIcon />,
  }),
};

export const SearchPage = {
  name: 'search',
  uniqueId: 'search',
  label: message('Search results'),
  path: '/drive/search',
  sortDescriptor: defaultSortDescriptor,
  noContentMessage: isSearchingOrFiltering => {
    if (isSearchingOrFiltering) {
      return {
        title: <Trans message="No matching results" />,
        description: (
          <Trans message="Try changing your search query or filters" />
        ),
        icon: <SearchIcon />,
      };
    }
    return {
      title: <Trans message="Begin typing or select a filter to search" />,
      description: (
        <Trans message="Search for files, folders and other content" />
      ),
      icon: <SearchIcon />,
    };
  },
} satisfies DrivePage;

export const SharesPage: DrivePage = {
  name: 'sharedWithMe',
  uniqueId: 'sharedWithMe',
  label: message('Shared'),
  path: '/drive/shares',
  sortDescriptor: defaultSortDescriptor,
  noContentMessage: () => ({
    title: <Trans message="Shared with me" />,
    description: (
      <Trans message="Files and folders other people have shared with you" />
    ),
    icon: <UsersIcon />,
  }),
};

export const TrashPage: DrivePage = {
  name: 'trash',
  uniqueId: 'trash',
  label: message('Trash'),
  path: '/drive/trash',
  sortDescriptor: defaultSortDescriptor,
  hasActions: true,
  queryParams: {
    deletedOnly: true,
  },
  noContentMessage: () => ({
    title: <Trans message="Trash is empty" />,
    description: (
      <Trans message="There are no files or folders in your trash currently" />
    ),
    icon: <Trash2Icon />,
  }),
};

export const StarredPage: DrivePage = {
  name: 'starred',
  uniqueId: 'starred',
  label: message('Starred'),
  path: '/drive/starred',
  sortDescriptor: defaultSortDescriptor,
  queryParams: {
    starredOnly: true,
  },
  noContentMessage: () => ({
    title: <Trans message="Nothing is starred" />,
    description: (
      <Trans message="Add stars to files and folders that you want to easily find later" />
    ),
    icon: <StarIcon />,
  }),
};

export const DRIVE_PAGES = [
  RootFolderPage,
  RecentPage,
  SearchPage,
  SharesPage,
  TrashPage,
  StarredPage,
];

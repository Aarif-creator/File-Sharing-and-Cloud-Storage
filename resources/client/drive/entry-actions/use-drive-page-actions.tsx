import {DrivePage, TrashPage} from '@app/drive/drive-page/drive-page';
import {driveState, useDriveStore} from '@app/drive/drive-store';
import {EntryAction} from '@app/drive/entry-actions/entry-action';
import {useDeleteEntries} from '@app/drive/files/queries/use-delete-entries';
import {useDriveUploadQueue} from '@app/drive/uploading/use-drive-upload-queue';
import {Trans} from '@ui/i18n/trans';
import {openUploadWindow} from '@ui/utils/files/open-upload-window';
import {
  FolderPlusIcon,
  FolderUpIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react';

export function useDrivePageActions(page: DrivePage): EntryAction[] {
  const newFolder = useNewFolderAction(page);
  const uploadFiles = useUploadFilesAction(page);
  const uploadFolder = useUploadFolderAction(page);
  const emptyTrash = useEmptyTrashAction();
  return [newFolder, uploadFiles, uploadFolder, emptyTrash].filter(
    action => !!action,
  ) as EntryAction[];
}

function useNewFolderAction(page: DrivePage): EntryAction | undefined {
  if (!page.folder || !page.folder.permissions['files.create']) return;
  return {
    label: <Trans message="New folder" />,
    icon: <FolderPlusIcon />,
    key: 'newFolder',
    execute: () => {
      if (page.folder) {
        driveState().setActiveActionDialog('newFolder', [page.folder]);
      }
    },
  };
}

function useUploadFilesAction(page: DrivePage): EntryAction | undefined {
  const {uploadFiles} = useDriveUploadQueue();
  if (!page.folder || !page.folder.permissions['files.create']) return;
  return {
    label: <Trans message="Upload files" />,
    icon: <UploadIcon />,
    key: 'uploadFiles',
    execute: async () => {
      uploadFiles(await openUploadWindow({multiple: true}));
    },
  };
}

function useUploadFolderAction(page: DrivePage): EntryAction | undefined {
  const {uploadFiles} = useDriveUploadQueue();
  if (!page.folder || !page.folder.permissions['files.create']) return;
  return {
    label: <Trans message="Upload folder" />,
    icon: <FolderUpIcon />,
    key: 'uploadFolder',
    execute: async () => {
      uploadFiles(await openUploadWindow({directory: true}));
    },
  };
}

function useEmptyTrashAction(): EntryAction | undefined {
  const deleteEntries = useDeleteEntries();
  const activePage = useDriveStore(s => s.activePage);
  if (activePage !== TrashPage) return;
  return {
    label: <Trans message="Empty trash" />,
    icon: <Trash2Icon />,
    key: 'emptyTrash',
    execute: () => {
      deleteEntries.mutate({entryIds: [], emptyTrash: true});
      driveState().selectEntries([]);
    },
  };
}

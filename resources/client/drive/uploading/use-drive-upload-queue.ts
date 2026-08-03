import {driveBaseKey} from '@app/app-queries';
import {driveState} from '@app/drive/drive-store';
import {useStorageSummary} from '@app/drive/layout/sidebar/storage-summary/storage-summary';
import {UploadType} from '@app/site-config';
import {queryClient} from '@common/http/query-client';
import {restrictionsFromConfig} from '@common/uploads/uploader/create-file-upload';
import {useFileUploadStore} from '@common/uploads/uploader/file-upload-provider';
import {useWorkspaceStore} from '@common/workspace/workspace-store';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';
import {UploadedFile} from '@ui/utils/files/uploaded-file';
import {useCallback} from 'react';

type UploadFilesFnOptions = {
  parentId?: number;
};

export type UploadFilesFn = (
  files: (File | UploadedFile)[] | FileList,
  options?: UploadFilesFnOptions,
) => void;

export function useDriveUploadQueue() {
  const uploadMultiple = useFileUploadStore(s => s.uploadMultiple);
  const {data: usage} = useStorageSummary();

  const uploadFiles: UploadFilesFn = useCallback(
    (files, {parentId} = {}) => {
      files = [...files].map(file => {
        return file instanceof UploadedFile ? file : new UploadedFile(file);
      });

      // check if this upload will not put user over their allowed storage space
      if (usage) {
        const sizeOfFiles = files.reduce((sum, file) => sum + file.size, 0);
        const currentlyUsing = usage.used;
        const availableSpace = usage.available ?? 0;

        if (sizeOfFiles + currentlyUsing > availableSpace) {
          toast.danger(
            message(
              'You have exhausted your allowed space of :space. Delete some files or upgrade your plan.',
              {values: {space: usage.availableFormatted}},
            ),
            {action: {action: '/pricing', label: message('Upgrade')}},
          );
          return;
        }
      }

      const restrictions = restrictionsFromConfig({
        uploadType: UploadType.bedrive,
      });

      uploadMultiple(files, {
        uploadType: UploadType.bedrive,
        metadata: {
          parentId: parentId ?? driveState().activePage?.folder?.id ?? null,
          workspaceId: useWorkspaceStore.getState().activeWorkspace?.id,
        },
        restrictions,
        onSuccess: () => {
          queryClient.invalidateQueries({queryKey: driveBaseKey});
        },
      });
      driveState().setUploadQueueIsOpen(true);
    },
    [uploadMultiple, usage],
  );
  return {uploadFiles};
}

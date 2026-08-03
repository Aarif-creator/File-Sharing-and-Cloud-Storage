import {
  createFolder,
  getFolderPath,
  listWorkspaceFolders,
  retrieveDriveEntryModel,
  updateDriveEntry,
} from '@app/gen/files';
import {
  closeFileRequest,
  createFileRequest,
  deleteFileRequest,
  listFileRequests,
  reopenFileRequest,
  retrieveFileRequest,
  sendFileRequestEmail,
  updateFileRequest,
} from '@app/gen/file-requests';
import {
  createShareableLink,
  deleteShareableLink,
  retrieveShareableLink,
  updateShareableLink,
} from '@app/gen/links';
import {
  changeSharedEntryPermissions,
  shareEntry,
  unshareEntries,
} from '@app/gen/sharing';
import {queryFactoryHelpers} from '@common/http/queries-file-helpers';
import {queryClient} from '@common/http/query-client';
import {mutationOptions, queryOptions} from '@tanstack/react-query';
import {BootstrapData} from '@ui/bootstrap-data/bootstrap-data';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {FirstParam, SecondParam} from '@ui/utils/ts/extract-params';

const get = queryFactoryHelpers.get;

export const driveBaseKey = ['drive'];
export const shareableLinksBaseKey = ['shareable-links'];
export const fileRequestsBaseKey = ['file-requests'];
export const listEntriesBaseKey = [...driveBaseKey, 'entries', 'index'];

export const listWorkspaceFoldersOptions = () =>
  queryOptions({
    queryKey: [driveBaseKey, 'user-folders', 'me'],
    queryFn: () => listWorkspaceFolders(),
    staleTime: Infinity,
  });

export const getFolderPathOptions = (
  hash: string,
  params?: SecondParam<typeof getFolderPath>,
) =>
  queryOptions({
    queryKey: [driveBaseKey, 'folders', 'path', hash, params],
    queryFn: () => getFolderPath(hash, params),
    staleTime: Infinity,
  });

export const createFolderOptions = () => {
  return mutationOptions({
    mutationFn: (payload: FirstParam<typeof createFolder>) =>
      createFolder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: driveBaseKey,
      });
    },
  });
};

export const retrieveEntryOptions = (id: number) =>
  queryOptions({
    queryKey: [...driveBaseKey, 'entries', 'get', id],
    queryFn: () => retrieveDriveEntryModel(id),
  });

export const updateEntryOptions = (entryId: number) =>
  mutationOptions({
    mutationFn: (body: SecondParam<typeof updateDriveEntry>) =>
      updateDriveEntry(entryId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: driveBaseKey});
    },
  });

export const shareEntryOptions = (id: number) =>
  mutationOptions({
    mutationFn: (payload: SecondParam<typeof shareEntry>) =>
      shareEntry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: driveBaseKey});
    },
  });

export const unshareEntriesOptions = () =>
  mutationOptions({
    mutationFn: (payload: FirstParam<typeof unshareEntries>) =>
      unshareEntries(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: driveBaseKey});
    },
  });

export const changeSharedEntryPermissionsOptions = (entryId: number) =>
  mutationOptions({
    mutationFn: (payload: SecondParam<typeof changeSharedEntryPermissions>) =>
      changeSharedEntryPermissions(entryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: driveBaseKey});
    },
  });

export const retrieveShareableLinkOptions = (entryId: number) =>
  queryOptions({
    queryKey: [...shareableLinksBaseKey, 'get', entryId],
    queryFn: () => retrieveShareableLink(entryId),
  });

export const createShareableLinkOptions = (entryId: number) =>
  mutationOptions({
    mutationFn: (payload: SecondParam<typeof createShareableLink>) =>
      createShareableLink(entryId, payload),
    onSuccess: () => {
      Promise.allSettled([
        queryClient.invalidateQueries({queryKey: shareableLinksBaseKey}),
        queryClient.invalidateQueries({queryKey: driveBaseKey}),
      ]);
    },
  });

export const updateShareableLinkOptions = (entryId: number) =>
  mutationOptions({
    mutationFn: (payload: SecondParam<typeof updateShareableLink>) =>
      updateShareableLink(entryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: shareableLinksBaseKey});
    },
  });

export const deleteShareableLinkOptions = (entryId: number) =>
  mutationOptions({
    mutationFn: (payload: SecondParam<typeof deleteShareableLink>) =>
      deleteShareableLink(entryId, payload),
    onSuccess: () => {
      Promise.allSettled([
        queryClient.invalidateQueries({queryKey: shareableLinksBaseKey}),
        queryClient.invalidateQueries({queryKey: driveBaseKey}),
      ]);
    },
  });

export const listFileRequestsOptions = (
  params?: FirstParam<typeof listFileRequests>,
) =>
  queryOptions({
    queryKey: [...fileRequestsBaseKey, 'index', params],
    queryFn: () => listFileRequests(params),
  });

export const retrieveFileRequestOptions = (id: number) =>
  queryOptions({
    queryKey: [...fileRequestsBaseKey, 'get', id],
    queryFn: () => retrieveFileRequest(id),
  });

export const createFileRequestOptions = () =>
  mutationOptions({
    mutationFn: (payload: FirstParam<typeof createFileRequest>) =>
      createFileRequest(payload),
    onSuccess: () => invalidateFileRequests(),
  });

export const updateFileRequestOptions = (id: number) =>
  mutationOptions({
    mutationFn: (payload: SecondParam<typeof updateFileRequest>) =>
      updateFileRequest(id, payload),
    onSuccess: () => invalidateFileRequests(),
  });

export const deleteFileRequestOptions = () =>
  mutationOptions({
    mutationFn: (id: number) => deleteFileRequest(id),
    onSuccess: () => invalidateFileRequests(),
  });

export const closeFileRequestOptions = () =>
  mutationOptions({
    mutationFn: (id: number) => closeFileRequest(id),
    onSuccess: () => invalidateFileRequests(),
  });

export const reopenFileRequestOptions = () =>
  mutationOptions({
    mutationFn: (id: number) => reopenFileRequest(id),
    onSuccess: () => invalidateFileRequests(),
  });

export const sendFileRequestEmailOptions = (id: number) =>
  mutationOptions({
    mutationFn: (payload: SecondParam<typeof sendFileRequestEmail>) =>
      sendFileRequestEmail(id, payload),
  });

function invalidateFileRequests() {
  // creating a request can also create its destination folder
  Promise.allSettled([
    queryClient.invalidateQueries({queryKey: fileRequestsBaseKey}),
    queryClient.invalidateQueries({queryKey: driveBaseKey}),
  ]);
}

export const landingPageDataOptions = () =>
  queryOptions<Required<Required<BootstrapData>['loaders']>['landingPage']>({
    staleTime: Infinity,
    queryKey: ['landing-page-data'],
    queryFn: () => get('landing-page-data'),
    initialData: () => {
      const data = getBootstrapData().loaders?.landingPage;
      if (data) {
        return data;
      }
    },
  });

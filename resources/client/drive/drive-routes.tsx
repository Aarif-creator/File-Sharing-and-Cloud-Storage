import {auth} from '@common/auth/use-auth';
import {queryClient} from '@common/http/query-client';
import {listWorkspacesOptions} from '@common/workspace/workspace-queries';
import {useWorkspaceStore} from '@common/workspace/workspace-store';
import {redirect, RouteObject} from 'react-router';

const fetchWorkspacesMiddleware = async () => {
  if (!useWorkspaceStore.getState().workspaces.length) {
    // will be loaded already via bootstrap data
    const response = await queryClient.ensureQueryData(listWorkspacesOptions());
    useWorkspaceStore.getState().init(response.data);
  }
};

export const driveRoutes: RouteObject[] = [
  {
    path: 'drive',
    lazy: () => import('@app/drive/layout/drive-layout'),
    middleware: [
      () => {
        if (!auth.isLoggedIn) {
          throw redirect('/login');
        }
      },
      fetchWorkspacesMiddleware,
    ],
    children: [
      {
        index: true,
        lazy: () => import('@app/drive/layout/entries-page'),
      },
      {
        path: 'folders/:hash',
        lazy: () => import('@app/drive/layout/entries-page'),
      },
      {
        path: 'shares',
        lazy: () => import('@app/drive/layout/entries-page'),
      },
      {
        path: 'recent',
        lazy: () => import('@app/drive/layout/entries-page'),
      },
      {
        path: 'starred',
        lazy: () => import('@app/drive/layout/entries-page'),
      },
      {
        path: 'trash',
        lazy: () => import('@app/drive/layout/entries-page'),
      },
      {
        path: 'search',
        lazy: () => import('@app/drive/layout/entries-page'),
      },
      {
        path: 'file-requests',
        lazy: () => import('@app/drive/file-requests/file-requests-page'),
      },
    ],
  },
  {
    path: 'drive/s/:hash',
    lazy: () =>
      import('@app/drive/shareable-link/shareable-link-page/shareable-link-page'),
  },
  {
    path: 'drive/r/:hash',
    lazy: () => import('@app/drive/file-requests/public/file-request-page'),
  },
];

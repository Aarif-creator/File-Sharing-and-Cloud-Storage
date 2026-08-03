import {adminRoutes} from '@app/admin/admin-routes';
import {landingPageDataOptions} from '@app/app-queries';
import {driveRoutes} from '@app/drive/drive-routes';
import {getSettingsPreviewMode} from '@common/admin/settings/preview/use-settings-preview-mode';
import {authRoutes} from '@common/auth/auth-routes';
import {getAccountSettingsOptions} from '@common/auth/ui/account-settings/account-settings-queries';
import {auth} from '@common/auth/use-auth';
import {
  billingPageChildRoutes,
  billingPageRoutes,
} from '@common/billing/billing-page/billing-page-routes';
import {checkoutRoutes} from '@common/billing/checkout/checkout-routes';
import {RootErrorElement, RootRoute} from '@common/core/common-provider';
import {commonRoutes} from '@common/core/common-routes';
import {queryClient} from '@common/http/query-client';
import {notificationRoutes} from '@common/notifications/notification-routes';
import {
  listWorkspaceRolesOptions,
  listWorkspacesOptions,
  retrieveWorkspaceOptions,
} from '@common/workspace/workspace-queries';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {FullPageLoader} from '@ui/progress/full-page-loader';
import {createBrowserRouter, redirect} from 'react-router';
import {Fragment} from 'react/jsx-runtime';

export const appRouter = createBrowserRouter(
  [
    {
      id: 'root',
      element: <RootRoute />,
      errorElement: <RootErrorElement />,
      hydrateFallbackElement: <FullPageLoader screen />,
      children: [
        {
          path: '/',
          loader: async () => {
            const isLoggedIn = auth.isLoggedIn;

            if (
              !isLoggedIn &&
              getBootstrapData().settings.homepage.type === 'loginPage' &&
              !getSettingsPreviewMode().isInsideSettingsPreview
            ) {
              return redirect('/login');
            }

            if (
              isLoggedIn &&
              !getSettingsPreviewMode().isInsideSettingsPreview
            ) {
              return redirect(getBootstrapData().auth_redirect_uri);
            }

            return await queryClient.ensureQueryData(landingPageDataOptions());
          },
          lazy: () => import('@app/landing-page'),
        },
        ...driveRoutes,
        ...adminRoutes,
        ...authRoutes({
          loginRoute: {
            lazy: () => import('@app/auth/app-login-page'),
          },
          registerRoute: {
            lazy: () => import('@app/auth/app-register-page'),
          },
          accountSettingsRoute: {
            lazy: () =>
              import('@app/account-settings/app-account-settings-page'),
            loader: () =>
              queryClient.ensureQueryData(getAccountSettingsOptions()),
            children: [
              {
                index: true,
                element: <Fragment />,
                middleware: [
                  () => {
                    throw redirect('/account-settings/general');
                  },
                ],
              },
              {
                path: 'general',
                lazy: async () => {
                  const {GeneralSettingsPanel} =
                    await import('@app/account-settings/app-account-settings-page');
                  return {Component: GeneralSettingsPanel};
                },
              },
              {
                path: 'security',
                lazy: async () => {
                  const {SecuritySettingsPanel} =
                    await import('@app/account-settings/app-account-settings-page');
                  return {Component: SecuritySettingsPanel};
                },
              },
              {
                path: 'api-keys',
                lazy: () => import('@app/account-settings/access-tokens-page'),
                middleware: [
                  () => {
                    if (!auth.hasPermission('api.access')) {
                      throw redirect('/account-settings/general');
                    }
                  },
                ],
              },

              // billing
              {
                path: 'billing',
                lazy: () =>
                  import('@app/account-settings/app-billing-page-layout'),
                handle: {billingRoutePrefix: '/account-settings'}, // for generating breadcrumbs, see billing-page-routes.tsx
                children: billingPageChildRoutes({
                  indexRoute: {
                    lazy: () =>
                      import('@app/account-settings/billing/billing-page'),
                  },
                }),
              },

              // workspaces
              {
                path: 'workspaces',
                lazy: () => import('@common/workspace/workspaces-datatable'),
                loader: () =>
                  queryClient.ensureQueryData(listWorkspacesOptions()),
              },
              {
                path: 'workspaces/:workspaceId',
                lazy: () =>
                  import('@common/workspace/workspace-page/workspace-page'),
                loader: async ({params}) => {
                  await Promise.all([
                    queryClient.ensureQueryData(
                      retrieveWorkspaceOptions(Number(params.workspaceId!)),
                    ),
                    queryClient.ensureQueryData(listWorkspaceRolesOptions()),
                  ]);
                },
                children: [
                  {
                    index: true,
                    lazy: () =>
                      import('@common/workspace/workspace-page/workspace-members-table'),
                  },
                  {
                    path: 'invites',
                    lazy: () =>
                      import('@common/workspace/workspace-page/workspace-invites-table'),
                  },
                ],
              },
            ],
          },
        }),
        ...notificationRoutes,
        ...checkoutRoutes,
        ...billingPageRoutes,
        ...commonRoutes,
      ],
    },
  ],
  {
    basename: getBootstrapData().settings.html_base_uri,
  },
);

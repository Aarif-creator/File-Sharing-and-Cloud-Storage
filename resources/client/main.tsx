import {appRouter} from '@app/app-router';
import {CustomPage} from '@app/gen/schemas/custom-page';
import {GetShareableLinkPageData200} from '@app/gen/schemas/get-shareable-link-page-data200';
import {ListProducts200} from '@app/gen/schemas/list-products200';
import {BaseBackendBootstrapData} from '@common/core/base-backend-bootstrap-data';
import {CommonProvider} from '@common/core/common-provider';
import {BaseBackendSettings} from '@common/core/settings/base-backend-settings';
import {ignoredSentryErrors} from '@common/http/errors/ignored-sentry-errors';
import {SectionConfig} from '@common/ui/landing-page/landing-page-config';
import * as Sentry from '@sentry/react';
import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {rootEl} from '@ui/root-el';
import {createRoot, RootOptions} from 'react-dom/client';
import './app.css';

declare module '@ui/settings/settings' {
  interface Settings extends BaseBackendSettings {
    homepage: {
      type: 'loginPage' | 'landingPage';
    };
    landingPage?: {
      sections: SectionConfig[];
    };
    drive?: {
      details_default_visibility: boolean;
      default_view: 'list' | 'grid';
      send_share_notification: boolean;
      send_file_request_notification: boolean;
      default_available_space: number;
      direct_links: boolean;
      copy_link_default: 'shareable' | 'direct';
    };
    share?: {
      suggest_emails: boolean;
    };
    ads?: {
      drive?: string;
      'file-preview'?: string;
      'landing-top'?: string;
      disable?: boolean;
    };
  }
}

declare module '@ui/bootstrap-data/bootstrap-data' {
  interface BootstrapData extends BaseBackendBootstrapData {
    loaders?: {
      landingPage?: {
        products: ListProducts200;
        sections?: SectionConfig[];
      };
      customPage?: {data: CustomPage};
      shareableLinkPage?: GetShareableLinkPageData200;
    };
  }
}

const data = getBootstrapData();
let options: RootOptions | undefined = undefined;
const sentryDsn = data.settings.logging.sentry_public;
if (sentryDsn && import.meta.env.PROD) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.2,
    ignoreErrors: ignoredSentryErrors,
    release: data.sentry_release,
  });

  options = {
    onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
      console.warn('Uncaught error', error, errorInfo.componentStack);
    }),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
  };
}

const app = <CommonProvider router={appRouter} />;

createRoot(rootEl, options).render(app);

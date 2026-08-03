import {SiteConfigContextValue} from '@common/core/settings/site-config-context';
import {CommonUploadType} from '@common/uploads/common-upload-type';
import {Trans} from '@ui/i18n/trans';
import driveSrc from './admin/verts/drive-top.webp';
import landingTopSrc from './admin/verts/landing-top.webp';
import filePreviewSrc from './admin/verts/shareable-link.webp';
import {FileEntrySharedNotificationRenderer} from './drive/notifications/file-entry-shared-notification-renderer';

const fileEntrySharedNotif = 'App\\Notifications\\FileEntrySharedNotif';
const fileRequestUploadNotif = 'App\\Notifications\\FileRequestUploadNotif';

export const SiteConfig: Partial<SiteConfigContextValue> = {
  notifications: {
    renderMap: {
      [fileEntrySharedNotif]: FileEntrySharedNotificationRenderer,
      [fileRequestUploadNotif]: FileEntrySharedNotificationRenderer,
    },
  },
  roles: {
    types: [
      {type: 'users', label: <Trans message="Users" />},
      {
        type: 'workspace',
        label: <Trans message="Workspace" />,
      },
    ],
  },
  demo: {
    email: 'admin@admin.com',
    password: 'password',
  },
  admin: {
    ads: [
      {
        slot: 'ads.landing-top',
        description: (
          <Trans message="This ad will appear at the top of the landing page." />
        ),
        image: landingTopSrc,
      },
      {
        slot: 'ads.drive',
        description: (
          <Trans message="This ad will appear on user drive page." />
        ),
        image: driveSrc,
      },
      {
        slot: 'ads.file-preview',
        description: (
          <Trans message="This ad will appear on shared file preview page." />
        ),
        image: filePreviewSrc,
      },
    ],
  },
};

export const UploadType = {
  ...CommonUploadType,
  bedrive: 'bedrive',
} as const;

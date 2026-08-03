import {useShareableLinkPage} from '@app/drive/shareable-link/shareable-link-page/use-shareable-link-page';
import {AdHost} from '@common/admin/ads/ad-host';
import {FilePreviewContainer} from '@common/uploads/components/file-preview/file-preview-container';
import {ShareableLinkNavbar} from './shareable-link-navbar';

export function ShareableLinkPageFilePreview() {
  const {link} = useShareableLinkPage();

  if (!link?.entry) return null;

  return (
    <div className="flex h-screen flex-col bg-muted">
      <ShareableLinkNavbar />
      <AdHost slot="file-preview" className="mx-auto mt-6" />
      <FilePreviewContainer
        entries={[link.entry]}
        showHeader={false}
        allowDownload={link.allow_download}
      />
    </div>
  );
}

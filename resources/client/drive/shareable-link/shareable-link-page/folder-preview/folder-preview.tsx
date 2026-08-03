import {ShareableLinkPageActionButtons} from '@app/drive/shareable-link/shareable-link-page/shareable-link-page-action-buttons';
import {useShareableLinkPage} from '@app/drive/shareable-link/shareable-link-page/use-shareable-link-page';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Empty} from '@shadcn/empty/empty';
import {Trans} from '@ui/i18n/trans';
import {FolderIcon} from 'lucide-react';
import {FolderPreviewFileView} from './folder-preview-file-view';
import {FolderPreviewHeader} from './folder-preview-header';

export function FolderPreview() {
  const {entries, isFetched} = useShareableLinkPage();
  const showEmptyMessage = isFetched && !entries?.length;

  return (
    <div className="flex h-screen flex-col">
      <Navbar.Root className="border-b">
        <Navbar.Logo />
        <Navbar.Content className="ml-auto">
          <ShareableLinkPageActionButtons />
          <Navbar.AuthContent />
        </Navbar.Content>
      </Navbar.Root>

      <FolderPreviewHeader />

      <div className="flex-1">
        <FileUploadProvider>
          {showEmptyMessage ? <EmptyMessage /> : <FolderPreviewFileView />}
        </FileUploadProvider>
      </div>
    </div>
  );
}

function EmptyMessage() {
  return (
    <Empty className="mt-20">
      <Empty.Header>
        <Empty.Media variant="icon">
          <FolderIcon />
        </Empty.Media>
        <Empty.Title>
          <Trans message="Folder is empty" />
        </Empty.Title>
        <Empty.Description>
          <Trans message="No files have been uploaded to this folder yet" />
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
}

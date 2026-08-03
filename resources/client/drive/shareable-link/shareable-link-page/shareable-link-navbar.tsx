import {useShareableLinkPage} from '@app/drive/shareable-link/shareable-link-page/use-shareable-link-page';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {FileTypeIcon} from '@common/uploads/components/file-type-icon/file-type-icon';
import {useIsMobileMediaQuery} from '@ui/utils/hooks/is-mobile-media-query';
import {ShareableLinkPageActionButtons} from './shareable-link-page-action-buttons';

export function ShareableLinkNavbar() {
  const {link} = useShareableLinkPage();
  const isMobile = useIsMobileMediaQuery();

  return (
    <Navbar.Root className="shrink-0 border-b">
      {!isMobile && <Navbar.Logo />}
      {link?.entry && link.entry.type !== 'folder' && (
        <div className="fex-auto flex min-w-0 items-center gap-1.5">
          <FileTypeIcon className="shrink-0" type={link.entry.type} />
          <div className="flex-auto truncate font-medium">
            {link.entry.name}
          </div>
        </div>
      )}
      <Navbar.Menu position="shareable-link-page" />
      <Navbar.Content className="ml-auto">
        <ShareableLinkPageActionButtons />
        <Navbar.AuthContent />
      </Navbar.Content>
    </Navbar.Root>
  );
}

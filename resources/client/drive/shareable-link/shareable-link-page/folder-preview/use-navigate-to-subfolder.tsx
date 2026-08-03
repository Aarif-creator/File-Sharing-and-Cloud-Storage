import {useShareableLinkPage} from '@app/drive/shareable-link/shareable-link-page/use-shareable-link-page';
import {ShareableLink} from '@app/gen/schemas/shareable-link';
import {useNavigate} from 'react-router';

function buildFolderHash(link: ShareableLink, folderHash?: string) {
  let hash = link.hash;
  if (folderHash && link.entry?.hash !== folderHash) {
    hash = `${hash}:${folderHash}`;
  }
  return hash;
}

export function useNavigateToSubfolder() {
  const {link} = useShareableLinkPage();
  const navigate = useNavigate();
  return (hash: string) => {
    if (!link) return;
    navigate(`/drive/s/${buildFolderHash(link, hash)}`);
  };
}

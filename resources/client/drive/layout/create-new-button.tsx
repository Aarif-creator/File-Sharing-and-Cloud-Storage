import {driveState, useDriveStore} from '@app/drive/drive-store';
import {useDriveUploadQueue} from '@app/drive/uploading/use-drive-upload-queue';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Trans} from '@ui/i18n/trans';
import {openUploadWindow} from '@ui/utils/files/open-upload-window';
import {FolderPlusIcon, FolderUpIcon, PlusIcon, UploadIcon} from 'lucide-react';

interface CreateNewButtonProps {
  isCompact?: boolean;
  className?: string;
}
export function CreateNewButton({isCompact, className}: CreateNewButtonProps) {
  const activePage = useDriveStore(s => s.activePage);
  const {uploadFiles} = useDriveUploadQueue();

  return (
    <div className={className}>
      <Dropdown.Root>
        <Dropdown.Trigger
          render={
            <Button
              variant="default"
              color="primary"
              size={isCompact ? 'icon' : 'default'}
              className={isCompact ? undefined : 'w-full'}
              disabled={!activePage?.canUpload}
            />
          }
        >
          {isCompact ? <PlusIcon className="size-5" /> : <UploadIcon />}
          {!isCompact && <Trans message="Upload" />}
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item
            onClick={async () => {
              uploadFiles(await openUploadWindow({multiple: true}));
            }}
          >
            <UploadIcon />
            <Trans message="Upload files" />
          </Dropdown.Item>
          <Dropdown.Item
            onClick={async () => {
              uploadFiles(await openUploadWindow({directory: true}));
            }}
          >
            <FolderUpIcon />
            <Trans message="Upload folder" />
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              const activeFolder = driveState().activePage?.folder;
              driveState().setActiveActionDialog(
                'newFolder',
                activeFolder ? [activeFolder] : [],
              );
            }}
          >
            <FolderPlusIcon />
            <Trans message="Create folder" />
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
}

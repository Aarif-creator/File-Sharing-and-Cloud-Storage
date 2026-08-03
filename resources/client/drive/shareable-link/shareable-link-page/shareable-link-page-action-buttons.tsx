import {useShareableLinkPage} from '@app/drive/shareable-link/shareable-link-page/use-shareable-link-page';
import {importIntoOwnDrive} from '@app/gen/links';
import {useAuth} from '@common/auth/use-auth';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {queryClient} from '@common/http/query-client';
import {useFileEntryUrls} from '@common/uploads/file-entry-urls';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {toast} from '@shadcn/toast/toast';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {downloadFileFromUrl} from '@ui/utils/files/download-file-from-url';
import {DownloadIcon, ImportIcon, MoreVerticalIcon} from 'lucide-react';
import {Fragment} from 'react';

export function ShareableLinkPageActionButtons() {
  const {link} = useShareableLinkPage();
  const {isLoggedIn} = useAuth();
  const {downloadUrl} = useFileEntryUrls(link?.entry);
  const importIntoDrive = useMutation({
    mutationFn: () => importIntoOwnDrive(link?.id ?? 0),
  });

  if (!link?.entry) return null;

  const handleImport = () => {
    importIntoDrive.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['shareable-link-page'],
        });
        toast.success(<Trans message="Imported into your drive" />);
      },
      onError: err => showHttpErrorToast(err),
    });
  };

  return (
    <div>
      {link.allow_download && <DownloadButton downloadUrl={downloadUrl} />}
      {isLoggedIn && link.allow_edit && (
        <Dropdown.Root>
          <Dropdown.Trigger
            render={
              <Button
                className="ml-1.5"
                variant="ghost"
                size="icon"
                disabled={importIntoDrive.isPending}
              />
            }
          >
            <MoreVerticalIcon />
          </Dropdown.Trigger>
          <Dropdown.Content className="w-max">
            <Dropdown.Item
              onClick={() => {
                if (downloadUrl) {
                  downloadFileFromUrl(downloadUrl);
                }
              }}
            >
              <DownloadIcon />
              <Trans message="Download" />
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleImport()}>
              <ImportIcon />
              <Trans message="Save a copy to your own drive" />
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
      )}
    </div>
  );
}

interface DownloadButtonProps {
  downloadUrl: string | undefined;
}
function DownloadButton({downloadUrl}: DownloadButtonProps) {
  const handleDownload = () => {
    if (downloadUrl) {
      downloadFileFromUrl(downloadUrl);
    }
  };

  return (
    <Fragment>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Button
              className="md:hidden"
              variant="ghost"
              size="icon"
              onClick={handleDownload}
            />
          }
        >
          <DownloadIcon />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Trans message="Download" />
        </Tooltip.Content>
      </Tooltip.Root>
      <Button
        className="max-md:hidden"
        size="sm"
        variant="default"
        color="default"
        onClick={handleDownload}
      >
        <DownloadIcon />
        <Trans message="Download" />
      </Button>
    </Fragment>
  );
}

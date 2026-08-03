import {getFileRequestLink} from '@app/drive/file-requests/get-file-request-link';
import {FileRequest} from '@app/gen/schemas/file-request';
import {Dialog} from '@shadcn/dialog/dialog';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@shadcn/forms/input-group/input-group';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {ContentCopyIcon} from '@ui/icons/material/ContentCopy';
import useClipboard from '@ui/utils/hooks/use-clipboard';
import {ReactElement} from 'react';

interface Props {
  children?: ReactElement<typeof Dialog.Trigger>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileRequest: FileRequest;
}

export function FileRequestLinkDialog({
  children,
  open,
  onOpenChange,
  fileRequest,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              <Trans message="Share file request" />
            </Dialog.Title>
            <Dialog.Description>
              <Trans
                message='Anyone with this link can upload files to ":title". They will not be able to see files uploaded by others.'
                values={{title: fileRequest.title}}
              />
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>
            <LinkInput hash={fileRequest.hash} />
            {fileRequest.has_password && (
              <p className="mt-3 text-sm text-muted-foreground">
                <Trans message="This request is password protected, remember to share the password separately." />
              </p>
            )}
            {fileRequest.status !== 'open' && (
              <p className="mt-3 text-sm text-destructive">
                {fileRequest.status === 'closed' ? (
                  <Trans message="This request is closed, the link will not accept uploads until you reopen it." />
                ) : (
                  <Trans message="The deadline for this request has passed, the link will not accept uploads." />
                )}
              </p>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function LinkInput({hash}: {hash: string}) {
  const {trans} = useTrans();
  const linkUrl = getFileRequestLink(hash);
  const [isCopied, setCopied] = useClipboard(linkUrl, {successDuration: 1000});

  return (
    <InputGroup>
      <InputGroupInput
        bindToHookForm={false}
        readOnly
        value={linkUrl}
        aria-label={trans({message: 'File request link'})}
        onFocus={e => {
          (e.target as HTMLInputElement).select();
        }}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          color="primary"
          variant="outline"
          size="xs"
          onClick={setCopied}
        >
          <ContentCopyIcon />
          {isCopied ? <Trans message="Copied!" /> : <Trans message="Copy" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

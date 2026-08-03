import {
  createShareableLinkOptions,
  deleteShareableLinkOptions,
  retrieveShareableLinkOptions,
} from '@app/app-queries';
import {useActiveDialogEntry} from '@app/drive/drive-store';
import {
  getDirectLink,
  getShareableLink,
} from '@app/drive/entry-actions/get-public-access-link';
import type {ShareDialogActivePanel} from '@app/drive/share-dialog/share-dialog';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {ShareableLink} from '@app/gen/schemas/shareable-link';
import {Button} from '@shadcn/button/button';
import {Field} from '@shadcn/forms/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@shadcn/forms/input-group/input-group';
import {Switch} from '@shadcn/forms/switch/switch';
import {toast} from '@shadcn/toast/toast';
import {useMutation, useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {ContentCopyIcon} from '@ui/icons/material/ContentCopy';
import {useSettings} from '@ui/settings/use-settings';
import useClipboard from '@ui/utils/hooks/use-clipboard';
import {randomString} from '@ui/utils/string/random-string';

interface ShareableLinkPanelProps {
  setActivePanel: (name: ShareDialogActivePanel) => void;
  entry: DriveEntry;
}
export function ShareableLinkPanel({
  setActivePanel,
  entry,
}: ShareableLinkPanelProps) {
  const query = useQuery(retrieveShareableLinkOptions(entry.id));
  const linkExists = !!query.data?.data;
  const createLink = useMutation(createShareableLinkOptions(entry.id));
  const deleteLink = useMutation(deleteShareableLinkOptions(entry.id));
  const isLoading =
    query.isLoading || createLink.isPending || deleteLink.isPending;

  const handleToggleLink = () => {
    if (linkExists) {
      deleteLink.mutate(undefined, {
        onError: () => {
          toast.error(<Trans message="Could not delete link" />);
        },
      });
    } else {
      createLink.mutate(
        {enable_direct_links: true},
        {
          onError: () => {
            toast.error(<Trans message="Could not create link" />);
          },
        },
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="font-semibold">
        <Trans message="Public access" />
      </div>
      <div className="flex items-center justify-between gap-3.5">
        <Field.Root orientation="horizontal">
          <Switch
            checked={linkExists}
            disabled={isLoading}
            onCheckedChange={() => handleToggleLink()}
          />
          <Field.Label>
            {linkExists ? (
              <Trans message="Shareable link is created" />
            ) : (
              <Trans message="Create shareable link" />
            )}
          </Field.Label>
        </Field.Root>
        {linkExists && (
          <Button
            variant="ghost"
            size="sm"
            color="primary"
            onClick={() => {
              setActivePanel('linkSettings');
            }}
          >
            <Trans message="Link settings" />
          </Button>
        )}
      </div>
      <ShareableLinkInput link={query.data?.data} />
    </div>
  );
}

interface ShareableLinkInputProps {
  link?: ShareableLink | null;
}
function ShareableLinkInput({link}: ShareableLinkInputProps) {
  const {drive} = useSettings();
  const {trans} = useTrans();
  const entry = useActiveDialogEntry();
  const hash = link?.hash || entry?.hash || randomString();
  const linkUrl = getShareableLink(hash);
  const [isCopied, setCopied] = useClipboard(linkUrl, {
    successDuration: 1000,
  });
  return (
    <div>
      <InputGroup>
        <InputGroupInput
          bindToHookForm={false}
          disabled={!link}
          readOnly
          value={linkUrl}
          aria-label={trans({message: 'Shareable link'})}
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
      {link && entry && drive?.direct_links && entry.type !== 'folder' ? (
        <CopyDirectLinkButton link={link} entry={entry} />
      ) : null}
    </div>
  );
}

type CopyDirectLinkButtonProps = {
  link: ShareableLink;
  entry: DriveEntry;
};
function CopyDirectLinkButton({link, entry}: CopyDirectLinkButtonProps) {
  const [isCopied, setCopied] = useClipboard(getDirectLink(link, entry), {
    successDuration: 1000,
  });
  return (
    <Button
      variant="outline"
      className="mt-2.5"
      size="xs"
      onClick={() => setCopied()}
    >
      {isCopied ? (
        <Trans message="Copied direct link!" />
      ) : (
        <Trans message="Copy direct link" />
      )}
    </Button>
  );
}

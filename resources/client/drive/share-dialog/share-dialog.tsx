import {retrieveEntryOptions} from '@app/app-queries';
import {LinkSettingsDialog} from '@app/drive/share-dialog/link-panel/link-settings-dialog';
import {ShareableLinkPanel} from '@app/drive/share-dialog/link-panel/shareable-link-panel';
import {SharePanel} from '@app/drive/share-dialog/share-panel';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {useControlledState} from '@react-stately/utils';
import {Dialog} from '@shadcn/dialog/dialog';
import {useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {ComponentProps, ReactElement, useState} from 'react';

export type ShareDialogActivePanel = 'main' | 'linkSettings';

type ShareDialogProps = {
  entry: DriveEntry;
  children?: ReactElement<ComponentProps<typeof Dialog.Trigger>>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ShareDialog({
  entry,
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: ShareDialogProps) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <ShareDialogContent entry={entry} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ShareDialogContent({entry: initialEntry}: {entry: DriveEntry}) {
  const {data} = useQuery({
    ...retrieveEntryOptions(initialEntry.id),
    initialData: {data: initialEntry},
  });

  const [activePanel, setActivePanel] =
    useState<ShareDialogActivePanel>('main');

  return (
    <Dialog.Content
      className="sm:max-w-lg"
      showCloseButton={activePanel === 'main'}
    >
      {activePanel === 'linkSettings' ? (
        <LinkSettingsDialog
          key="one"
          setActivePanel={setActivePanel}
          entry={data.data}
        />
      ) : (
        <MainPanel
          key="two"
          setActivePanel={setActivePanel}
          entry={data.data}
        />
      )}
    </Dialog.Content>
  );
}

interface MainPanelProps {
  setActivePanel: (name: ShareDialogActivePanel) => void;
  entry: DriveEntry;
}
function MainPanel({setActivePanel, entry}: MainPanelProps) {
  return (
    <>
      <Dialog.Header>
        <Dialog.Title>
          <Trans message="Share ‘:name’" values={{name: entry.name}} />
        </Dialog.Title>
      </Dialog.Header>
      <Dialog.Body className="relative">
        <SharePanel className="mb-7.5 border-b pb-7.5" entry={entry} />
        <ShareableLinkPanel setActivePanel={setActivePanel} entry={entry} />
      </Dialog.Body>
    </>
  );
}

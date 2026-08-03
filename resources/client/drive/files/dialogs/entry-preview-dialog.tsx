import {useShareAction} from '@app/drive/entry-actions/use-entry-actions';
import {useActivePageEntries} from '@app/drive/files/queries/use-active-page-entries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {FilePreviewDialog} from '@common/uploads/components/file-preview/file-preview-dialog';
import {Button} from '@shadcn/button/button';
import {Fragment, useState} from 'react';

interface EntryPreviewDialogProps {
  selectedEntry: DriveEntry;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function EntryPreviewDialog({
  selectedEntry,
  open,
  onOpenChange,
}: EntryPreviewDialogProps) {
  const files = useActivePageEntries().items.filter(
    entry => entry.type !== 'folder',
  );
  const defaultActiveIndex = files.findIndex(
    file => file.id === selectedEntry?.id,
  );
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  return (
    <FilePreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      allowDownload={selectedEntry.permissions['files.download']}
      headerActionsLeft={
        <DriveActions activeIndex={activeIndex} entries={files} />
      }
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      entries={files}
    />
  );
}

interface DriveActionsProps {
  activeIndex: number;
  entries: DriveEntry[];
}
function DriveActions({activeIndex, entries}: DriveActionsProps) {
  const selectedEntry = entries[activeIndex];
  const share = useShareAction([selectedEntry]);
  if (!selectedEntry || !share) return null;

  return (
    <Fragment>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => {
          share.execute();
        }}
      >
        {share.icon}
      </Button>
      <Button
        className="max-md:hidden"
        variant="ghost"
        size="sm"
        onClick={() => {
          share.execute();
        }}
      >
        {share.icon}
        {share.label}
      </Button>
    </Fragment>
  );
}

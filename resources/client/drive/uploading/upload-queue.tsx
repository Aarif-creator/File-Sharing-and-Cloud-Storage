import {driveState, useDriveStore} from '@app/drive/drive-store';
import {useFileUploadStore} from '@common/uploads/uploader/file-upload-provider';
import {UploadQueueItem} from '@common/uploads/uploader/ui/upload-queue-item';
import {Button} from '@shadcn/button/button';
import {useVirtualizer} from '@tanstack/react-virtual';
import {Trans} from '@ui/i18n/trans';
import {XIcon} from 'lucide-react';
import {ReactElement, useRef} from 'react';

export function UploadQueue() {
  const isOpen = useDriveStore(s => s.uploadQueueIsOpen);

  return (
    isOpen && (
      <div className="fixed right-4 bottom-4 z-50 w-93.5 animate-in overflow-hidden rounded-card-sm border bg-background text-sm shadow-xl duration-300 fade-in-0 slide-in-from-bottom-1">
        <Header />
        <UploadList />
      </div>
    )
  );
}

export function Header() {
  const inProgressUploadsCount = useFileUploadStore(s => s.activeUploadsCount);
  const completedUploadsCount = useFileUploadStore(
    s => s.completedUploadsCount,
  );
  const clearInactive = useFileUploadStore(s => s.clearInactive);

  let message: ReactElement;
  if (inProgressUploadsCount) {
    message = (
      <Trans
        message="Uploading :count files"
        values={{count: inProgressUploadsCount}}
      />
    );
  } else if (completedUploadsCount) {
    message = (
      <Trans
        message="Uploaded :count files"
        values={{count: completedUploadsCount}}
      />
    );
  } else {
    message = <Trans message="No active uploads" />;
  }

  // only allow closing upload queue if there are no active uploads
  return (
    <div className="flex min-h-11 items-center justify-between gap-2.5 border-b px-3 py-1 font-medium">
      {message}
      {inProgressUploadsCount === 0 ? (
        <Button
          variant="ghost"
          size="icon"
          className="-mr-1.5"
          onClick={() => {
            driveState().setUploadQueueIsOpen(false);
            // wait for upload queue panel animation to complete, then clear inactive uploads
            setTimeout(() => {
              clearInactive();
            }, 200);
          }}
        >
          <XIcon />
        </Button>
      ) : undefined}
    </div>
  );
}

function UploadList() {
  const uploads = useFileUploadStore(s => s.fileUploads);
  const uploadsArray = [...uploads.values()];
  const ref = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: uploads.size,
    getScrollElement: () => ref.current,
    estimateSize: () => 60,
    overscan: 4,
  });

  return (
    <div className="max-h-80 overflow-y-auto" ref={ref}>
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => {
          const upload = uploadsArray[virtualItem.index];
          return (
            <UploadQueueItem
              key={upload.file.id}
              file={upload.file}
              className="absolute top-0 left-0 w-full py-3 pr-4 pl-3"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

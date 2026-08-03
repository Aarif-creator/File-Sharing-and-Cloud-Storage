import {useLinkPageStore} from '@app/drive/shareable-link/shareable-link-page/link-page-store';
import {useShareableLinkPage} from '@app/drive/shareable-link/shareable-link-page/use-shareable-link-page';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {AdHost} from '@common/admin/ads/ad-host';
import {FilePreviewDialog} from '@common/uploads/components/file-preview/file-preview-dialog';
import {Spinner} from '@shadcn/spinner/spinner';
import {ProgressCircle} from '@ui/progress/progress-circle';
import clsx from 'clsx';
import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router';
import {FolderPreviewFileGrid} from './folder-preview-file-grid';
import {FolderPreviewFileTable} from './folder-preview-file-table';
import {useNavigateToSubfolder} from './use-navigate-to-subfolder';

interface FolderPreviewChildrenProps {
  className?: string;
}
export function FolderPreviewFileView({className}: FolderPreviewChildrenProps) {
  const {pathname} = useLocation();
  const navigateToSubfolder = useNavigateToSubfolder();
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>();
  const viewMode = useLinkPageStore(s => s.viewMode);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    link,
    entries,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isPlaceholderData,
  } = useShareableLinkPage();

  // close preview modal on back/forward navigation
  useEffect(() => {
    setActivePreviewIndex(undefined);
  }, [pathname]);

  useEffect(() => {
    const sentinelEl = sentinelRef.current;
    if (!sentinelEl) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(sentinelEl);
    return () => {
      observer.unobserve(sentinelEl);
    };
  }, [hasNextPage, fetchNextPage]);

  if (!link || isPlaceholderData) {
    return (
      <div
        className={clsx(
          'flex h-full animate-in items-center justify-center fade-in',
          className,
        )}
      >
        <ProgressCircle isIndeterminate />
      </div>
    );
  }

  const handlePreview = (entry: DriveEntry, index: number) => {
    if (entry.type === 'folder') {
      navigateToSubfolder(entry.hash);
    } else {
      setActivePreviewIndex(index);
    }
  };

  const folderEntries = entries || [];

  return (
    <>
      <div
        className={clsx(
          'file-grid-container flex-auto overflow-auto px-3.5 pb-3.5 md:px-6 md:pb-6',
          className,
        )}
      >
        <AdHost slot="file-preview" className="mb-10" />
        {viewMode === 'grid' ? (
          <FolderPreviewFileGrid
            entries={folderEntries}
            onEntrySelected={handlePreview}
          />
        ) : (
          <FolderPreviewFileTable
            entries={folderEntries}
            onEntrySelected={handlePreview}
          />
        )}
        <span ref={sentinelRef} aria-hidden />
        {isFetchingNextPage && (
          <div className="mt-6 flex w-full justify-center">
            <Spinner />
          </div>
        )}
      </div>
      {activePreviewIndex != undefined && (
        <FilePreviewDialog
          open
          onOpenChange={open => {
            if (!open) {
              setActivePreviewIndex(undefined);
            }
          }}
          entries={folderEntries}
          defaultActiveIndex={activePreviewIndex}
          allowDownload={link.allow_download}
        />
      )}
    </>
  );
}

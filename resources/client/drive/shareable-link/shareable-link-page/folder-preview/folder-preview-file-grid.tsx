import {BaseFileGridItem} from '@app/drive/file-view/file-grid/base-file-grid-item';
import {DriveEntry} from '@app/gen/schemas/drive-entry';

export interface FolderPreviewGridProps {
  entries: DriveEntry[];
  onEntrySelected: (entry: DriveEntry, index: number) => void;
}
export function FolderPreviewFileGrid({
  entries,
  onEntrySelected,
}: FolderPreviewGridProps) {
  return (
    <div className="file-grid">
      {entries.map((entry, index) => (
        <BaseFileGridItem
          tabIndex={-1}
          className="cursor-pointer bg hover:shadow-md"
          entry={entry}
          key={entry.id}
          onContextMenu={e => {
            e.preventDefault();
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              onEntrySelected(entry, index);
            }
          }}
          onClick={() => {
            onEntrySelected(entry, index);
          }}
        />
      ))}
    </div>
  );
}

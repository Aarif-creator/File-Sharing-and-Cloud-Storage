import {FileGridItem} from '@app/drive/file-view/file-grid/file-grid-item';
import {DriveEntry} from '@app/gen/schemas/drive-entry';

interface FileGridProps {
  entries: DriveEntry[];
}
export function FileGrid({entries}: FileGridProps) {
  return (
    <div className="file-grid-container">
      <div className="file-grid">
        {entries.map(entry => {
          return <FileGridItem key={entry.id} entry={entry} />;
        })}
      </div>
    </div>
  );
}

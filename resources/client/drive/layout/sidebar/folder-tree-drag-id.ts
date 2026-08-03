import {DriveEntry} from '@app/gen/schemas/drive-entry';

export function makeFolderTreeDragId(entry: DriveEntry) {
  return `${entry.id}-tree`;
}

export function isFolderTreeDragId(id: string | number): boolean {
  return `${id}`.endsWith('-tree');
}

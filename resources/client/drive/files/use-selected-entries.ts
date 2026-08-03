import {listEntriesBaseKey} from '@app/app-queries';
import {driveState, useDriveStore} from '@app/drive/drive-store';
import {useActivePageEntries} from '@app/drive/files/queries/use-active-page-entries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {ListDriveEntries200} from '@app/gen/schemas/list-drive-entries200';
import {queryClient} from '@common/http/query-client';
import {InfiniteData} from '@tanstack/react-query';

export function useSelectedEntries(): DriveEntry[] {
  const ids = useDriveStore(s => s.selectedEntries);
  const {items} = useActivePageEntries();
  return Array.from(ids)
    .map(id => items.find(entry => entry.id === id))
    .filter(e => !!e);
}

export function getSelectedEntries(): DriveEntry[] {
  const ids = Array.from(driveState().selectedEntries);

  const caches = queryClient.getQueriesData<InfiniteData<ListDriveEntries200>>({
    queryKey: listEntriesBaseKey,
  });

  const selectedEntries: DriveEntry[] = [];

  for (const cache of caches) {
    const entries = cache[1] ? cache[1].pages.flatMap(p => p.data) : [];
    for (const entry of entries) {
      if (
        ids.includes(entry.id) &&
        !selectedEntries.find(e => e.id === entry.id)
      ) {
        selectedEntries.push(entry);
      }
    }
  }

  return selectedEntries;
}

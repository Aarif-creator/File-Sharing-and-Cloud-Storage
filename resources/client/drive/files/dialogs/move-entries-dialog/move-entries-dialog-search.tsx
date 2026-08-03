import {listEntriesBaseKey} from '@app/app-queries';
import {listDriveEntries} from '@app/gen/files';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {Autocomplete} from '@shadcn/autocomplete/autocomplete';
import {InputGroupAddon} from '@shadcn/forms/input-group/input-group';
import {Spinner} from '@shadcn/spinner/spinner';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from 'lucide-react';
import {useState} from 'react';
import {useDebounce} from 'use-debounce';

export function MoveEntriesDialogSearch({
  onFolderSelected,
}: {
  onFolderSelected: (folder: DriveEntry) => void;
}) {
  const {trans} = useTrans();
  const searchLabel = trans({message: 'Search folders'});
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);

  const params = {
    section: 'search',
    query: debouncedQuery,
    type: 'folder',
  };
  const {isFetching, data} = useQuery({
    queryKey: [...listEntriesBaseKey, params],
    queryFn: () => listDriveEntries(params),
    enabled: !!debouncedQuery,
    placeholderData: keepPreviousData,
  });

  const folders = data?.data ?? [];

  return (
    <Autocomplete
      items={folders}
      value={query}
      onValueChange={(value, details) => {
        if (details.reason === 'item-press') {
          setQuery('');
          return;
        }
        setQuery(value);
      }}
      itemToStringValue={folder => folder.name}
      filter={null}
      openOnInputClick={false}
    >
      <Autocomplete.Input
        placeholder={searchLabel}
        aria-label={searchLabel}
        className="w-full"
      >
        <InputGroupAddon align="inline-end">
          {isFetching ? (
            <Spinner />
          ) : (
            <SearchIcon className="size-4 text-muted-foreground" />
          )}
        </InputGroupAddon>
      </Autocomplete.Input>

      <Autocomplete.Content>
        <Autocomplete.Empty>
          {query && !isFetching ? <Trans message="No folders found" /> : null}
        </Autocomplete.Empty>
        <Autocomplete.List>
          {(folder: DriveEntry) => (
            <Autocomplete.Item
              key={folder.id}
              value={folder}
              onClick={() => onFolderSelected(folder)}
            >
              {folder.name}
            </Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Content>
    </Autocomplete>
  );
}

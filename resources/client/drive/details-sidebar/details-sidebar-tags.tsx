import {updateEntryOptions} from '@app/app-queries';
import {
  createTagOptions,
  listTagsOptions,
} from '@app/drive/details-sidebar/tags-queries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {Combobox} from '@shadcn/forms/combobox/combobox';
import {Field} from '@shadcn/forms/field';
import {Spinner} from '@shadcn/spinner/spinner';
import {useMutation, useQuery} from '@tanstack/react-query';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useFilter} from '@ui/i18n/use-filter';
import {useTrans} from '@ui/i18n/use-trans';
import {PlusIcon} from 'lucide-react';
import {useState} from 'react';

type TagItem = {
  id: number;
  name: string;
  isCreateItem?: boolean;
};

const createTagItems: TagItem[] = [{id: 0, name: '0', isCreateItem: true}];

export function DetailsSidebarTags({entry}: {entry: DriveEntry}) {
  const {trans} = useTrans();
  const {contains} = useFilter({
    sensitivity: 'base',
    usage: 'search',
  });

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<TagItem[]>(entry.tags ?? []);
  const [inputValue, setInputValue] = useState('');

  const updateEntry = useMutation(updateEntryOptions(entry.id));
  const createTag = useMutation(createTagOptions());

  const query = useQuery({
    ...listTagsOptions('dashboard', {per_page: 100}),
  });
  const allTags = query.data?.data ?? [];

  const filteredTags = allTags.filter(tag => contains(tag.name, inputValue));

  const shouldShowCreateItem =
    !filteredTags.length && inputValue && inputValue.length > 2;

  const items = shouldShowCreateItem ? createTagItems : filteredTags;

  const handleCreateTag = (name: string) => {
    createTag.mutate(
      {name},
      {
        onSuccess: response => {
          setValue(prev => {
            const newTags = [...prev, response.data];
            handleSyncTags(newTags);
            return newTags;
          });
          setInputValue('');
          setOpen(false);
        },
        onError: err => showHttpErrorToast(err),
      },
    );
  };

  const handleSyncTags = (tags: TagItem[]) => {
    const isSame = tags.every(tag => value.some(v => v.id === tag.id));
    if (isSame) {
      return;
    }

    updateEntry.mutate(
      {tags: tags.map(tag => tag.id)},
      {
        onError: err => showHttpErrorToast(err),
      },
    );
  };

  return (
    <Field.Root name="tags" className="mt-5 border-t pt-5">
      <Field.Label className="text-base">
        <Trans message="Tags" />
      </Field.Label>
      <Combobox.Root
        disabled={
          query.isLoading || createTag.isPending || updateEntry.isPending
        }
        items={items}
        open={open}
        multiple
        onOpenChange={setOpen}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        isItemEqualToValue={(item, value) => item.id === value.id}
        filter={null}
        value={value}
        onValueChange={tags => {
          setValue(tags);
          handleSyncTags(tags);
        }}
      >
        <Combobox.Chips>
          <Combobox.Value>
            {(value: TagItem[]) => (
              <>
                {value.map(item => (
                  <Combobox.Chip key={item.id}>{item.name}</Combobox.Chip>
                ))}
                <Combobox.ChipsInput
                  placeholder={trans(message('Add tag...'))}
                />
              </>
            )}
          </Combobox.Value>
        </Combobox.Chips>
        <Combobox.Content>
          <Combobox.List>
            {(item: TagItem) => {
              if (item.isCreateItem) {
                return (
                  <Combobox.Item
                    key={item.id}
                    value={item}
                    onClick={e => {
                      e.preventBaseUIHandler();
                      handleCreateTag(inputValue);
                    }}
                  >
                    {createTag.isPending ? <Spinner /> : <PlusIcon />}
                    <Trans message={`Create "${inputValue}"`} />
                  </Combobox.Item>
                );
              }
              return (
                <Combobox.Item key={item.id} value={item}>
                  {item.name}
                </Combobox.Item>
              );
            }}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>
      <Field.Error />
    </Field.Root>
  );
}

import {shareEntryOptions} from '@app/app-queries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {listUsersOptions} from '@common/admin/users/users-queries';
import {parseApiError} from '@common/http/errors/parsed-api-error';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {Avatar} from '@shadcn/avatar/avatar';
import {Button} from '@shadcn/button/button';
import {Combobox} from '@shadcn/forms/combobox/combobox';
import {Field} from '@shadcn/forms/field';
import {Item} from '@shadcn/item/item';
import {toast} from '@shadcn/toast/toast';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {keepPreviousData, useMutation, useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {useSettings} from '@ui/settings/use-settings';
import {isEmail} from '@ui/utils/string/is-email';
import axios from 'axios';
import {TriangleAlertIcon} from 'lucide-react';
import {ClipboardEvent, KeyboardEvent, useCallback, useState} from 'react';
import {MemberList} from './member-list';
import {
  PermissionSelector,
  PermissionSelectorItem,
  PermissionSelectorItems,
} from './permission-selector';

type ShareInviteItem = {
  id: number | string;
  name: string | null;
  email: string;
  image?: string | null;
  invalid?: boolean;
};

interface SharePanelProps {
  className?: string;
  entry: DriveEntry;
}

export function SharePanel({className, entry}: SharePanelProps) {
  const {trans} = useTrans();
  const {share} = useSettings();
  const shareEntry = useMutation(shareEntryOptions(entry.id));
  const [value, setValue] = useState<ShareInviteItem[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionSelectorItem>(PermissionSelectorItems[0]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const normalizeInviteItem = useCallback(
    (item: ShareInviteItem): ShareInviteItem => {
      const email = item.email.trim();
      return {
        ...item,
        id: item.id ?? email,
        name: item.name ?? email,
        email,
        invalid: !isEmail(email),
      };
    },
    [],
  );

  const allEmailsValid = value.every(item => !item.invalid);

  const query = useQuery({
    ...listUsersOptions({
      per_page: 7,
      query: inputValue,
    }),
    enabled: !!share?.suggest_emails,
    placeholderData: keepPreviousData,
  });
  const suggestions = query.data?.data ?? [];

  const addEmailFromInput = useCallback(
    (email: string) => {
      const item = normalizeInviteItem({id: email, name: email, email});
      setValue(prev => {
        if (
          prev.some(v => v.email.toLowerCase() === item.email.toLowerCase())
        ) {
          return prev;
        }
        return [...prev, item];
      });
    },
    [normalizeInviteItem],
  );

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addEmailFromInput(inputValue);
      setInputValue('');
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    const emails = paste.match(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi,
    );
    if (emails?.length) {
      e.preventDefault();
      emails.forEach(email => addEmailFromInput(email));
      setInputValue('');
    }
  };

  const handleShare = () => {
    setIsSharing(true);
    shareEntry.mutate(
      {
        emails: value.map(v => v.email),
        permissions: selectedPermission.value,
      },
      {
        onSuccess: () => {
          setValue([]);
          toast.success(
            <Trans
              message="Shared with [one 1 person|other {count} people]"
              values={{count: value.length}}
            />,
          );
        },
        onSettled: () => {
          setIsSharing(false);
        },
        onError: err => {
          const parsedError = parseApiError(err);
          if (axios.isAxiosError(err) && err.response) {
            if (parsedError.errors?.emails) {
              toast.error(parsedError.errors?.emails[0]);
            } else {
              showHttpErrorToast(err);
            }
          }
        },
      },
    );
  };

  return (
    <div className={className}>
      <Field.Root>
        <Field.Label>
          <Trans message="Invite people" />
        </Field.Label>
        <Combobox.Root
          multiple
          open={open}
          onOpenChange={setOpen}
          items={suggestions}
          filter={null}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          value={value}
          onValueChange={items =>
            setValue(items.map(item => normalizeInviteItem(item)))
          }
          isItemEqualToValue={(a, b) =>
            a.email.toLowerCase() === b.email.toLowerCase()
          }
          itemToStringLabel={item => item.email}
        >
          <Combobox.Chips>
            <Combobox.Value>
              {(items: ShareInviteItem[]) => (
                <>
                  {items.map(item => (
                    <Combobox.Chip key={item.id}>
                      {item.invalid ? (
                        <Tooltip>
                          <Tooltip.Trigger>
                            <TriangleAlertIcon className="size-3.5 text-destructive" />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <Trans message="Not a valid email" />
                          </Tooltip.Content>
                        </Tooltip>
                      ) : null}
                      {item.image ? (
                        <Avatar size="xs">
                          <Avatar.Image src={item.image} />
                          <Avatar.ColorFallback>
                            {item.name}
                          </Avatar.ColorFallback>
                        </Avatar>
                      ) : null}
                      {item.email}
                    </Combobox.Chip>
                  ))}
                  <Combobox.ChipsInput
                    placeholder={trans({message: 'Enter email addresses'})}
                    onKeyDown={handleInputKeyDown}
                    onPaste={handlePaste}
                  />
                </>
              )}
            </Combobox.Value>
          </Combobox.Chips>
          {share?.suggest_emails ? (
            <Combobox.Content>
              <Combobox.List>
                {(item: ShareInviteItem) => (
                  <Combobox.Item key={item.id} value={item}>
                    <Item size="xs" className="w-full">
                      <Item.Media variant="image">
                        <Avatar size="sm">
                          <Avatar.Image src={item.image} />
                          <Avatar.ColorFallback>
                            {item.name}
                          </Avatar.ColorFallback>
                        </Avatar>
                      </Item.Media>
                      <Item.Content>
                        <Item.Title>{item.name}</Item.Title>
                        <Item.Description>{item.email}</Item.Description>
                      </Item.Content>
                    </Item>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Content>
          ) : null}
        </Combobox.Root>
      </Field.Root>
      <div className="mt-2 flex items-center justify-between gap-3">
        <PermissionSelector
          onChange={setSelectedPermission}
          value={selectedPermission}
        />
        {value.length ? (
          <Button
            size="sm"
            disabled={isSharing || !allEmailsValid}
            onClick={() => handleShare()}
          >
            <Trans message="Share" />
          </Button>
        ) : null}
      </div>
      <MemberList className="mt-7.5" entry={entry} />
    </div>
  );
}

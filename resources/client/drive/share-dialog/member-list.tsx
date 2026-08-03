import {
  changeSharedEntryPermissionsOptions,
  unshareEntriesOptions,
} from '@app/app-queries';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {DriveEntryUsersItem} from '@app/gen/schemas/drive-entry-users-item';
import {useAuth} from '@common/auth/use-auth';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {Avatar} from '@shadcn/avatar/avatar';
import {Button} from '@shadcn/button/button';
import {Item} from '@shadcn/item/item';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {CloseIcon} from '@ui/icons/material/Close';
import {cn} from '@ui/utils/cn';
import {useState} from 'react';
import {
  getPermissionItemForUser,
  PermissionSelector,
  PermissionSelectorItem,
} from './permission-selector';

interface MemberListProps {
  className?: string;
  entry: DriveEntry;
}

export function MemberList({className, entry}: MemberListProps) {
  if (!entry) return null;

  const users = entry.users;

  return (
    <div className={cn(className)}>
      <div className="mb-3.5 text-sm font-semibold">
        <Trans message="People with access" />
      </div>
      <div className="flex flex-col gap-5">
        {users?.map(user => (
          <MemberListItem key={user.id} user={user} entry={entry} />
        ))}
      </div>
    </div>
  );
}

interface MemberListItemProps {
  user: DriveEntryUsersItem;
  entry: DriveEntry;
}
function MemberListItem({user, entry}: MemberListItemProps) {
  const {user: currentUser} = useAuth();
  const isCurrentUser = user.id === currentUser?.id;

  return (
    <Item size="xs" className="p-0">
      <Item.Media>
        <Avatar>
          <Avatar.Image src={user.image} />
          <Avatar.ColorFallback>{user.name}</Avatar.ColorFallback>
        </Avatar>
      </Item.Media>
      <Item.Content>
        <Item.Title>
          {user.name}{' '}
          {isCurrentUser ? (
            <span className="text-muted-foreground">
              (<Trans message="You" />)
            </span>
          ) : null}
        </Item.Title>
        <Item.Description>{user.email}</Item.Description>
      </Item.Content>
      <Item.Actions>
        {user.owns_entry ? (
          <span className="text-muted-foreground">
            <Trans message="Owner" />
          </span>
        ) : (
          <ActionButtons
            user={user}
            entry={entry}
            isCurrentUser={isCurrentUser}
          />
        )}
      </Item.Actions>
    </Item>
  );
}

interface ActionButtonsProps {
  user: DriveEntryUsersItem;
  entry: DriveEntry;
  isCurrentUser: boolean;
}
function ActionButtons({user, entry, isCurrentUser}: ActionButtonsProps) {
  const changePermissions = useMutation(
    changeSharedEntryPermissionsOptions(entry.id),
  );
  const unshareEntry = useMutation(unshareEntriesOptions());
  const [activePermission, setActivePermission] =
    useState<PermissionSelectorItem>(() => {
      return getPermissionItemForUser(user);
    });

  const handleUnshare = () => {
    unshareEntry.mutate(
      {
        user_id: user.id,
        entry_ids: [entry.id],
      },
      {
        onSuccess: () => {
          toast.success(<Trans message="Member removed" />);
        },
        onError: err =>
          showHttpErrorToast(err, <Trans message="Could not remove member" />),
      },
    );
  };

  const handleChangePermissions = (item: PermissionSelectorItem) => {
    changePermissions.mutate({
      user_id: user.id,
      permissions: item.value,
    });
    setActivePermission(item);
  };

  return (
    <>
      {!isCurrentUser && entry.permissions['files.update'] && (
        <PermissionSelector
          isDisabled={changePermissions.isPending}
          onChange={item => {
            handleChangePermissions(item);
          }}
          value={activePermission}
        />
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={unshareEntry.isPending}
        onClick={() => handleUnshare()}
      >
        <CloseIcon />
      </Button>
    </>
  );
}

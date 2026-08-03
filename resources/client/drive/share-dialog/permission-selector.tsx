import {DriveEntryUsersItem} from '@app/gen/schemas/drive-entry-users-item';
import {DriveEntryUsersItemEntryPermissions} from '@app/gen/schemas/drive-entry-users-item-entry-permissions';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Trans} from '@ui/i18n/trans';
import {ChevronDownIcon} from 'lucide-react';
import {ReactNode} from 'react';

export interface PermissionSelectorItem {
  key: keyof DriveEntryUsersItemEntryPermissions;
  value: Partial<DriveEntryUsersItemEntryPermissions>;
  label: ReactNode;
}

export const PermissionSelectorItems: PermissionSelectorItem[] = [
  {
    key: 'view',
    value: {view: true},
    label: <Trans message="Can view" />,
  },
  {
    key: 'download',
    value: {view: true, download: true},
    label: <Trans message="Can Download" />,
  },
  {
    key: 'edit',
    value: {view: true, download: true, edit: true},
    label: <Trans message="Can edit" />,
  },
];

interface Props {
  onChange: (value: PermissionSelectorItem) => void;
  value: PermissionSelectorItem;
  isDisabled?: boolean;
}
export function PermissionSelector({value, onChange, isDisabled}: Props) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        render={
          <Button
            variant="default"
            color="default"
            size="sm"
            disabled={isDisabled}
          />
        }
      >
        {value.label}
        <ChevronDownIcon data-icon="inline-end" />
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.RadioGroup
          value={value.key}
          onValueChange={key => {
            if (key !== value.key) {
              onChange(PermissionSelectorItems.find(p => p.key === key)!);
            }
          }}
        >
          {PermissionSelectorItems.map(item => (
            <Dropdown.RadioItem key={item.key} value={item.key}>
              {item.label}
            </Dropdown.RadioItem>
          ))}
        </Dropdown.RadioGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

export function getPermissionItemForUser(
  user: DriveEntryUsersItem,
): PermissionSelectorItem {
  const {download, edit} = user.entry_permissions;
  if (edit) {
    return PermissionSelectorItems.find(item => item.key === 'edit')!;
  }
  if (download) {
    return PermissionSelectorItems.find(item => item.key === 'download')!;
  }
  return PermissionSelectorItems.find(item => item.key === 'view')!;
}

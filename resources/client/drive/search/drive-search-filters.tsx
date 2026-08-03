import {BackendFilter} from '@common/datatable/filters/backend-filter';
import {
  DateRangeFilterItem,
  DateRangeFilterItemProps,
  DateRangeFilterPopoverContent,
  DateRangeFilterPopoverContentProps,
} from '@common/datatable/filters/panels/date-range-filter';
import {
  SelectFilterItem,
  SelectFilterItemProps,
  SelectFilterPopoverContent,
  SelectFilterPopoverContentProps,
} from '@common/datatable/filters/panels/select-filter';
import {Trans} from '@ui/i18n/trans';

export const driveSearchFilters: BackendFilter[] = [
  {
    key: 'type',
    label: <Trans message="Type" />,
    valueType: 'string',
    item: (props: SelectFilterItemProps) => <SelectFilterItem {...props} />,
    popoverContent: (props: SelectFilterPopoverContentProps) => (
      <SelectFilterPopoverContent
        {...props}
        placeholder={<Trans message="Select type" />}
        items={[
          {label: <Trans message="Text" />, value: 'text'},
          {label: <Trans message="Audio" />, value: 'audio'},
          {label: <Trans message="Video" />, value: 'video'},
          {label: <Trans message="Image" />, value: 'image'},
          {label: <Trans message="PDF" />, value: 'pdf'},
          {label: <Trans message="Spreadsheet" />, value: 'spreadsheet'},
          {label: <Trans message="Word Document" />, value: 'word'},
          {label: <Trans message="Photoshop" />, value: 'photoshop'},
          {label: <Trans message="Archive" />, value: 'archive'},
          {label: <Trans message="Folder" />, value: 'folder'},
        ]}
      />
    ),
  },
  {
    key: 'owner',
    label: <Trans message="Owner" />,
    valueType: 'string',
    item: (props: SelectFilterItemProps) => <SelectFilterItem {...props} />,
    popoverContent: (props: SelectFilterPopoverContentProps) => (
      <SelectFilterPopoverContent
        {...props}
        placeholder={<Trans message="Select owner" />}
        defaultValue={{value: 'me'}}
        items={[
          {label: <Trans message="Me" />, value: 'me'},
          {label: <Trans message="Not me" />, value: 'not_me'},
        ]}
      />
    ),
  },
  {
    key: 'created_at',
    label: <Trans message="Date uploaded" />,
    valueType: 'dateRange',
    item: (props: DateRangeFilterItemProps) => (
      <DateRangeFilterItem {...props} />
    ),
    popoverContent: (props: DateRangeFilterPopoverContentProps) => (
      <DateRangeFilterPopoverContent {...props} />
    ),
  },
  {
    key: 'updated_at',
    label: <Trans message="Last changed" />,
    valueType: 'dateRange',
    item: (props: DateRangeFilterItemProps) => (
      <DateRangeFilterItem {...props} />
    ),
    popoverContent: (props: DateRangeFilterPopoverContentProps) => (
      <DateRangeFilterPopoverContent {...props} />
    ),
  },
  {
    key: 'location',
    label: <Trans message="Location" />,
    valueType: 'string',
    item: (props: SelectFilterItemProps) => <SelectFilterItem {...props} />,
    popoverContent: (props: SelectFilterPopoverContentProps) => (
      <SelectFilterPopoverContent
        {...props}
        placeholder={<Trans message="Select location" />}
        items={[
          {label: <Trans message="In trash" />, value: 'trashed'},
          {label: <Trans message="Starred" />, value: 'starred'},
        ]}
      />
    ),
  },
  {
    key: 'sharing',
    label: <Trans message="Sharing" />,
    valueType: 'string',
    item: (props: SelectFilterItemProps) => <SelectFilterItem {...props} />,
    popoverContent: (props: SelectFilterPopoverContentProps) => (
      <SelectFilterPopoverContent
        {...props}
        placeholder={<Trans message="Select sharing" />}
        items={[
          {label: <Trans message="Shared with me" />, value: 'shared_with_me'},
          {label: <Trans message="Shared by me" />, value: 'shared_by_me'},
          {
            label: <Trans message="Has shareable link" />,
            value: 'has_shareable_link',
          },
        ]}
      />
    ),
  },
];

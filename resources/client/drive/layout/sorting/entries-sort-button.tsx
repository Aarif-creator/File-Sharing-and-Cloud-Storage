import {
  AVAILABLE_SORTS,
  DriveSortDescriptor,
  SortColumn,
} from '@app/drive/layout/sorting/available-sorts';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Trans} from '@ui/i18n/trans';
import {ArrowDownWideNarrowIcon} from 'lucide-react';

interface Props {
  descriptor: DriveSortDescriptor;
  onChange: (value: DriveSortDescriptor) => void;
  isDisabled?: boolean;
}
export function EntriesSortButton({
  descriptor,
  onChange,
  isDisabled = false,
}: Props) {
  const column = descriptor.orderBy;
  const direction = descriptor.orderDir;
  const sort = AVAILABLE_SORTS.find(s => s.id === column);

  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        render={<Button variant="outline" disabled={isDisabled} />}
        onContextMenu={e => e.stopPropagation()}
      >
        <ArrowDownWideNarrowIcon />
        {sort?.label}
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Group>
          <Dropdown.GroupLabel>
            <Trans message="Direction" />
          </Dropdown.GroupLabel>
          <Dropdown.RadioGroup
            value={direction || 'desc'}
            onValueChange={orderDir => {
              onChange({
                orderBy: column,
                orderDir: orderDir as 'asc' | 'desc',
              });
            }}
          >
            <Dropdown.RadioItem value="asc">
              <Trans message="Ascending" />
            </Dropdown.RadioItem>
            <Dropdown.RadioItem value="desc">
              <Trans message="Descending" />
            </Dropdown.RadioItem>
          </Dropdown.RadioGroup>
        </Dropdown.Group>
        <Dropdown.Separator />
        <Dropdown.Group>
          <Dropdown.GroupLabel>
            <Trans message="Sort By" />
          </Dropdown.GroupLabel>
          <Dropdown.RadioGroup
            value={column || ''}
            onValueChange={orderBy => {
              onChange({
                orderBy: orderBy as SortColumn,
                orderDir: direction,
              });
            }}
          >
            {AVAILABLE_SORTS.map(item => (
              <Dropdown.RadioItem key={item.id} value={item.id}>
                {item.label}
              </Dropdown.RadioItem>
            ))}
          </Dropdown.RadioGroup>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

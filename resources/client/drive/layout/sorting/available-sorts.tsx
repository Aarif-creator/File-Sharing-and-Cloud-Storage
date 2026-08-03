import {Trans} from '@ui/i18n/trans';
import {ReactNode} from 'react';

export const AVAILABLE_SORTS: {id: SortColumn; label: ReactNode}[] = [
  {id: 'file_size', label: <Trans message="Size" />},
  {id: 'name', label: <Trans message="Name" />},
  {id: 'updated_at', label: <Trans message="Last modified" />},
  {id: 'created_at', label: <Trans message="Upload date" />},
  {id: 'type', label: <Trans message="Type" />},
  {id: 'extension', label: <Trans message="Extension" />},
];

export type SortColumn =
  'file_size' | 'name' | 'updated_at' | 'created_at' | 'type' | 'extension';

export type SortDirection = 'desc' | 'asc';

export interface DriveSortDescriptor {
  orderBy?: SortColumn;
  orderDir?: SortDirection;
}

export const defaultSortDescriptor: DriveSortDescriptor = {
  orderBy: 'created_at',
  orderDir: 'desc',
};

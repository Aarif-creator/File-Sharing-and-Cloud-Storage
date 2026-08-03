import {ReactNode} from 'react';

export interface EntryAction {
  label: ReactNode;
  icon: ReactNode;
  key: string;
  execute: () => void;
}

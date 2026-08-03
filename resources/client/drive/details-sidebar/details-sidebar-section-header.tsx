import clsx from 'clsx';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  margin?: string;
  className?: string;
}
export function DetailsSidebarSectionHeader({
  children,
  margin = 'mb-5',
}: Props) {
  return (
    <div className={clsx('text-base font-medium text-foreground', margin)}>
      {children}
    </div>
  );
}

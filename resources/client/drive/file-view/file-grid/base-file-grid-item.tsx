import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {FileThumbnail} from '@common/uploads/components/file-type-icon/file-thumbnail';
import clsx from 'clsx';
import React, {ComponentPropsWithoutRef, ReactNode} from 'react';

interface BaseFileGridItemProps extends ComponentPropsWithoutRef<'div'> {
  entry: DriveEntry;
  className?: string;
  isSelected?: boolean;
  isMobileMode?: boolean;
  footerAdornment?: ReactNode;
}

export const BaseFileGridItem = React.forwardRef<
  HTMLDivElement,
  BaseFileGridItemProps
>(
  (
    {entry, className, isSelected, isMobileMode, footerAdornment, ...domProps},
    ref,
  ) => {
    return (
      <div
        {...domProps}
        ref={ref}
        className={clsx(
          'grid-item flex aspect-square flex-col overflow-hidden rounded-card border shadow-xs outline-hidden transition-shadow-opacity select-none dark:bg-card',
          isSelected && 'border-primary',
          className,
        )}
      >
        <div className="relative min-h-0 flex-auto">
          <FileThumbnail
            className="h-full w-full"
            iconClassName="block w-17.5 h-17.5 absolute m-auto inset-0"
            file={entry}
          />
        </div>
        <Footer
          entry={entry}
          isSelected={isSelected}
          isMobile={isMobileMode}
          adornment={footerAdornment}
        />
      </div>
    );
  },
);

interface FooterProps {
  entry: DriveEntry;
  isSelected?: boolean;
  isMobile?: boolean;
  adornment?: ReactNode;
}
function Footer({entry, isSelected, isMobile, adornment}: FooterProps) {
  return (
    <div
      className={clsx(
        'flex h-12 shrink-0 items-center text-sm',
        isMobile
          ? 'justify-between gap-2.5 pr-0.5 pl-4.5'
          : 'justify-center px-4',
        isSelected && 'bg-primary/10',
      )}
    >
      <div className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
        {entry.name}
      </div>
      {adornment}
    </div>
  );
}

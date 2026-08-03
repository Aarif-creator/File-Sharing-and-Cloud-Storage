import { Tooltip } from '@shadcn/tooltip/tooltip';
import { Trans } from '@ui/i18n/trans';
import { cn } from '@ui/utils/cn';
import { DatabaseIcon } from 'lucide-react';
import { useStorageSummary } from './storage-summary';

interface CompactStorageTriggerProps {
  className?: string;
}

export function CompactStorageTrigger({className}: CompactStorageTriggerProps) {
  const {data} = useStorageSummary();

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        className={cn(
          'flex size-8 items-center justify-center rounded-button text-muted-foreground hover:bg-sidebar-accent hover:text-accent-foreground',
          className,
        )}
        render={<button type="button" />}
      >
        <DatabaseIcon className="size-4" />
      </Tooltip.Trigger>
      <Tooltip.Content side="right" align="center">
        <Trans
          message=":used of :available used"
          values={{
            used: data?.usedFormatted,
            available: data?.availableFormatted,
          }}
        />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

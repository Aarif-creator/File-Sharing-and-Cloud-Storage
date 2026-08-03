import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
} from '@shadcn/meter/meter';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {DatabaseIcon} from 'lucide-react';
import {useStorageSummary} from './storage-summary';

export function StorageMeter({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'md';
  className?: string;
}) {
  const {data} = useStorageSummary();

  if (!data) return null;

  return (
    <Meter
      value={data?.percentage ?? 0}
      className={cn(size === 'sm' ? 'text-xs' : 'text-sm', className)}
    >
      <MeterLabel>
        <DatabaseIcon />
        <Trans
          message=":used of :available used"
          values={{
            used: data?.usedFormatted,
            available: data?.availableFormatted,
          }}
        />
      </MeterLabel>
      <MeterTrack className={cn(size === 'sm' ? 'h-1' : 'h-2')}>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  );
}

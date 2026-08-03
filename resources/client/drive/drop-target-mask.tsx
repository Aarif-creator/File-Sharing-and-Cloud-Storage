import {Trans} from '@ui/i18n/trans';

interface DropTargetMaskProps {
  isVisible: boolean;
}
export function DropTargetMask({isVisible}: DropTargetMaskProps) {
  return isVisible ? (
    <>
      <div className="pointer-events-none absolute inset-0 min-h-full w-full animate-in rounded-card border-2 border-dashed border-primary bg-primary/10 fade-in"></div>
      <div className="animte-in pointer-events-none fixed right-0 bottom-4 left-0 mx-auto max-w-max rounded-card bg-primary p-2.5 text-primary-foreground shadow fade-in">
        <Trans message="Drop files to upload them to this folder." />
      </div>
    </>
  ) : null;
}

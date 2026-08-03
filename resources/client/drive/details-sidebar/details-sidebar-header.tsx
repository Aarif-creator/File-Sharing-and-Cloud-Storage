import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {FileTypeIcon} from '@common/uploads/components/file-type-icon/file-type-icon';
import {Button} from '@shadcn/button/button';
import {XIcon} from 'lucide-react';
import {ReactNode, use} from 'react';

interface HeaderProps {
  entryType: DriveEntry['type'];
  entryName: ReactNode;
}
export function DetailsSidebarHeader({entryType, entryName}: HeaderProps) {
  const {rightSidebar} = use(DashboardLayoutContext);
  return (
    <div className="mb-9.5 flex gap-4">
      <FileTypeIcon className="size-6" type={entryType} />
      <div className="mr-auto min-w-0 flex-auto text-base leading-6 font-medium wrap-break-word text-foreground">
        {entryName}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="-mt-1.5 ml-auto"
        onClick={() => {
          rightSidebar.setStatus('collapsed');
        }}
      >
        <XIcon />
      </Button>
    </div>
  );
}

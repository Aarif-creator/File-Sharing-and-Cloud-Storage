import {EntriesSortButton} from '@app/drive/layout/sorting/entries-sort-button';
import {
  linkPageState,
  useLinkPageStore,
} from '@app/drive/shareable-link/shareable-link-page/link-page-store';
import {useShareableLinkPage} from '@app/drive/shareable-link/shareable-link-page/use-shareable-link-page';
import {Toggle} from '@shadcn/toggle';
import {ToggleGroup} from '@shadcn/toggle-group/toggle-group';
import {LayoutGridIcon, LayoutListIcon} from 'lucide-react';
import {FolderPreviewBreadcrumb} from './folder-preview-breadcrumb';

export function FolderPreviewHeader() {
  const activeSort = useLinkPageStore(s => s.activeSort);
  const viewMode = useLinkPageStore(s => s.viewMode);
  const {link, isFetching} = useShareableLinkPage();
  const hasEntry = link && link.entry;

  return (
    <div className="flex min-w-0 shrink-0 flex-col justify-between gap-3.5 p-3.5 md:h-22.5 md:flex-row md:items-center md:p-6">
      {hasEntry && <FolderPreviewBreadcrumb link={link} folder={link.entry} />}
      {hasEntry && (
        <div className="flex items-center justify-between md:justify-start">
          <EntriesSortButton
            isDisabled={isFetching}
            descriptor={activeSort}
            onChange={value => {
              linkPageState().setActiveSort(value);
            }}
          />
          <div className="ml-4 md:border-l md:pl-4">
            <ToggleGroup
              variant="segmented"
              buttonVariant="ghost"
              value={[viewMode]}
              onValueChange={value =>
                linkPageState().setViewMode(value[0] as any)
              }
            >
              <Toggle value="list">
                <LayoutListIcon />
              </Toggle>
              <Toggle value="grid">
                <LayoutGridIcon />
              </Toggle>
            </ToggleGroup>
          </div>
        </div>
      )}
    </div>
  );
}

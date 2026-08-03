import {SearchPage} from '@app/drive/drive-page/drive-page';
import {useDriveStore} from '@app/drive/drive-store';
import {driveSearchFilters} from '@app/drive/search/drive-search-filters';
import {AddFilterPopover} from '@common/datatable/filters/add-filter-popover';
import {FilterList} from '@common/datatable/filters/filter-list/filter-list';
import {DashboardLayoutContext} from '@common/ui/dashboard/dashboard-layout-context';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@shadcn/forms/input-group/input-group';
import {message} from '@ui/i18n/message';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon} from '@ui/icons/material/Search';
import {useContext, useState} from 'react';
import {useSearchParams} from 'react-router';

const alwaysShownFilters = driveSearchFilters.map(f => f.key);

export function SearchFilterList() {
  const activePage = useDriveStore(s => s.activePage);
  const {isMobileMode} = useContext(DashboardLayoutContext);

  if (activePage !== SearchPage) {
    return null;
  }

  return (
    <div className="px-3.5 md:px-6.5" onContextMenu={e => e.stopPropagation()}>
      {isMobileMode ? (
        <MobileSection />
      ) : (
        <FilterList
          filters={driveSearchFilters}
          pinnedFilters={alwaysShownFilters}
        />
      )}
    </div>
  );
}

function MobileSection() {
  const navigate = useNavigate();
  const {trans} = useTrans();
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('query') || '');

  return (
    <div className="flex items-center gap-4">
      <form
        className="contents"
        onSubmit={e => {
          e.preventDefault();
          // blur input so mobile keyboard is hidden
          if (document.activeElement?.tagName === 'INPUT') {
            (document.activeElement as HTMLInputElement).blur();
          }
          navigate(
            {
              pathname: SearchPage.path,
              search: `?query=${inputValue}`,
            },
            {replace: true},
          );
        }}
      >
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <SearchIcon className="size-5" />
          </InputGroupAddon>
          <InputGroupInput
            autoFocus
            placeholder={trans(message('Type to search'))}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
        </InputGroup>
      </form>
      <AddFilterPopover filters={driveSearchFilters} />
    </div>
  );
}

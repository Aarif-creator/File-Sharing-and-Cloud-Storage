import {SearchPage} from '@app/drive/drive-page/drive-page';
import {useDriveStore} from '@app/drive/drive-store';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@shadcn/forms/input-group/input-group';
import {useTrans} from '@ui/i18n/use-trans';
import {SearchIcon, XIcon} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {useLocation, useSearchParams} from 'react-router';

export function NavbarSearch() {
  const {trans} = useTrans();
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const activePage = useDriveStore(s => s.activePage);
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const prevPathnameRef = useRef(pathname);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (
      prevPathnameRef.current === SearchPage.path &&
      pathname !== SearchPage.path
    ) {
      setResetKey(k => k + 1);
    }
    prevPathnameRef.current = pathname;
  }, [pathname]);

  const formKey = `other-${resetKey}`;

  return (
    <form
      key={formKey}
      className="ml-7 max-w-180 flex-1"
      onSubmit={e => {
        e.preventDefault();
        if (inputRef.current?.value) {
          navigate(
            {
              pathname: SearchPage.path,
              search: `?query=${inputRef.current.value}`,
            },
            {replace: true},
          );
        } else {
          navigate(SearchPage.path, {replace: true});
        }
      }}
    >
      <InputGroup className="h-11.5 rounded-button border-none bg-background in-data-[variant=default]:bg-accent in-data-[variant=inset]:shadow-sm *:data-[slot=input-group-control]:md:text-base dark:bg-card">
        <InputGroupAddon>
          <InputGroupButton size="icon-sm" type="submit">
            <SearchIcon />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          placeholder={trans({message: 'Search files and folders'})}
          aria-label={trans({message: 'Search files and folders'})}
          defaultValue={searchParams.get('query') ?? ''}
          name="drive-search-query"
          onFocus={() => {
            if (activePage !== SearchPage) {
              navigate(SearchPage.path);
            }
          }}
        />
        {searchParams.get('query') ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-sm"
              onClick={() => {
                inputRef.current!.value = '';
                navigate(SearchPage.path, {replace: true});
              }}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </form>
  );
}

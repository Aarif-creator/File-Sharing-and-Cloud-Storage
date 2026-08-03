import {
  closeFileRequestOptions,
  deleteFileRequestOptions,
  listFileRequestsOptions,
  reopenFileRequestOptions,
} from '@app/app-queries';
import {driveState} from '@app/drive/drive-store';
import {CrupdateFileRequestDialog} from '@app/drive/file-requests/crupdate-file-request-dialog';
import {FileRequestLinkDialog} from '@app/drive/file-requests/file-request-link-dialog';
import {SendFileRequestEmailDialog} from '@app/drive/file-requests/send-file-request-email-dialog';
import {FileRequest} from '@app/gen/schemas/file-request';
import {useAuth} from '@common/auth/use-auth';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Badge} from '@shadcn/badge/badge';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Empty} from '@shadcn/empty/empty';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@shadcn/forms/input-group/input-group';
import {Item} from '@shadcn/item/item';
import {GenericTable} from '@shadcn/table/generic-table';
import {TablePagination} from '@shadcn/table/utils/table-pagination';
import {useTable} from '@shadcn/table/utils/use-table';
import {useTableQueryState} from '@shadcn/table/utils/use-table-query-state';
import {toast} from '@shadcn/toast/toast';
import {useMutation, useSuspenseQuery} from '@tanstack/react-query';
import {ColumnDef} from '@tanstack/react-table';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {cn} from '@ui/utils/cn';
import {useMediaQuery} from '@ui/utils/hooks/use-media-query';
import {
  CheckIcon,
  InboxIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import {useEffect, useState} from 'react';

export function Component() {
  const isCompactLayout = useMediaQuery('(max-width: 1024px)');
  const [searchQuery, setSearchQuery] = useState('');
  const {queryState, setQueryState} = useTableQueryState();
  const query = useSuspenseQuery(listFileRequestsOptions());
  const items = query.data?.data ?? [];
  const isFiltering = searchQuery.length > 0;

  const table = useTable({
    data: items,
    columns,
    isClientSide: true,
    globalFilter: searchQuery,
    sort: queryState.sort,
    onSortChange: sort => setQueryState({sort}),
    pagination: {
      per_page: queryState.per_page,
      page: queryState.page,
    },
    onPaginationChange: pagination => setQueryState({...pagination}),
  });

  const visibleItems = table.getRowModel().rows.map(row => row.original);
  const isEmpty = table.getRowCount() === 0;

  useEffect(() => {
    driveState().setActivePage(null);
  }, []);

  useEffect(
    () => () => {
      driveState().reset();
    },
    [],
  );

  return (
    <>
      <StaticPageTitle>
        <Trans message="File requests" />
      </StaticPageTitle>
      <DashboardLayout.MainSection>
        <DashboardLayout.SectionHeader>
          <DashboardLayout.SidebarToggle />
          <DashboardLayout.SectionTitle>
            <h1>
              <Trans message="File requests" />
            </h1>
          </DashboardLayout.SectionTitle>
          <CreateFileRequestButton />
        </DashboardLayout.SectionHeader>

        <DashboardLayout.SectionContent className="mt-1">
          <DashboardLayout.SectionContentHeader>
            <FileRequestsSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </DashboardLayout.SectionContentHeader>
          <DashboardLayout.SectionScrollContainer>
            {!isEmpty || isFiltering ? (
              isCompactLayout ? (
                <MobileFileRequestList fileRequests={visibleItems} />
              ) : (
                <GenericTable table={table} />
              )
            ) : null}

            {isEmpty && !query.isLoading && (
              <FileRequestsEmptyState isFiltering={isFiltering} />
            )}

            <TablePagination table={table} />
          </DashboardLayout.SectionScrollContainer>
        </DashboardLayout.SectionContent>
      </DashboardLayout.MainSection>
    </>
  );
}

function FileRequestsSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const {trans} = useTrans();

  return (
    <InputGroup className="w-auto max-w-110 min-w-45 flex-1">
      <InputGroupAddon align="inline-start">
        <SearchIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        placeholder={trans(message('Search file requests...'))}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value ? (
        <InputGroupAddon align="inline-end" onClick={() => onChange('')}>
          <InputGroupButton size="icon-xs">
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

const columns: ColumnDef<FileRequest>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <Trans message="Name" />,
    cell: ({row}) => {
      const isClosed = row.original.status === 'closed';
      return (
        <div className="min-w-0">
          <div
            className={cn(
              'flex items-center gap-1.5 font-medium',
              isClosed && 'text-muted-foreground line-through',
            )}
          >
            <span className="truncate">{row.original.title}</span>
            {row.original.has_password ? (
              <LockIcon
                className="size-3 shrink-0"
                aria-label="Password protected"
              />
            ) : null}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            <Trans
              message="[one 1 item|other :count items]"
              values={{count: row.original.uploads_count}}
            />
          </div>
        </div>
      );
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: () => <Trans message="Created" />,
    cell: ({row}) =>
      row.original.created_at ? (
        <FormattedDate date={row.original.created_at} />
      ) : (
        '-'
      ),
  },
  {
    id: 'deadline',
    accessorKey: 'deadline',
    header: () => <Trans message="Expiration" />,
    cell: ({row}) =>
      row.original.deadline ? (
        <FormattedDate date={row.original.deadline} />
      ) : (
        '-'
      ),
  },
  {
    id: 'uploads_count',
    accessorKey: 'uploads_count',
    header: () => <Trans message="Uploads" />,
  },
  {
    id: 'actions',
    size: 1,
    header: () => (
      <span className="sr-only">
        <Trans message="Actions" />
      </span>
    ),
    cell: ({row}) => <RowActions fileRequest={row.original} />,
  },
];

function StatusBadge({status}: {status: string}) {
  if (status === 'open') {
    return (
      <Badge variant="secondary">
        <Trans message="Open" />
      </Badge>
    );
  }
  if (status === 'expired') {
    return (
      <Badge variant="outline">
        <Trans message="Past deadline" />
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <Trans message="Closed" />
    </Badge>
  );
}

function CreateFileRequestButton() {
  const [open, setOpen] = useState(false);
  const {hasPermission} = useAuth();

  if (!hasPermission('file_requests.create')) {
    return null;
  }

  return (
    <>
      <CrupdateFileRequestDialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger render={<Button color="primary" />}>
          <PlusIcon />
          <Trans message="Request files" />
        </Dialog.Trigger>
      </CrupdateFileRequestDialog>
    </>
  );
}

function RowActions({fileRequest}: {fileRequest: FileRequest}) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const closeRequest = useMutation(closeFileRequestOptions());
  const reopenRequest = useMutation(reopenFileRequestOptions());
  const deleteRequest = useMutation(deleteFileRequestOptions());
  const isClosed = fileRequest.closed_at != null;

  const handleToggleClosed = () => {
    const mutation = isClosed ? reopenRequest : closeRequest;
    mutation.mutate(fileRequest.id, {
      onSuccess: () => {
        toast.success(
          isClosed ? (
            <Trans message="File request reopened" />
          ) : (
            <Trans message="File request closed" />
          ),
        );
      },
      onError: err => showHttpErrorToast(err),
    });
  };

  const handleDelete = () => {
    deleteRequest.mutate(fileRequest.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        toast.success(<Trans message="File request deleted" />);
      },
      onError: err => showHttpErrorToast(err),
    });
  };

  return (
    <>
      <FileRequestLinkDialog
        fileRequest={fileRequest}
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
      />
      <SendFileRequestEmailDialog
        fileRequest={fileRequest}
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />
      <CrupdateFileRequestDialog
        fileRequest={fileRequest}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      <AlertDialog.Root
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Content size="sm">
            <AlertDialog.Header>
              <AlertDialog.Title>
                <Trans message="Delete file request" />
              </AlertDialog.Title>
              <AlertDialog.Description>
                <Trans message="The link will stop working, but files that were already uploaded will stay in your drive." />
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel>
                <Trans message="Cancel" />
              </AlertDialog.Cancel>
              <AlertDialog.Action
                color="danger"
                disabled={deleteRequest.isPending}
                onClick={handleDelete}
              >
                <Trans message="Delete" />
              </AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <Dropdown>
        <Dropdown.Trigger
          render={<Button variant="ghost" color="default" size="icon" />}
        >
          <MoreVerticalIcon />
        </Dropdown.Trigger>
        <Dropdown.Content align="end">
          <Dropdown.Item onClick={() => setLinkDialogOpen(true)}>
            <LinkIcon />
            <Trans message="Copy link" />
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setEmailDialogOpen(true)}>
            <MailIcon />
            <Trans message="Send via email" />
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setEditDialogOpen(true)}>
            <PencilIcon />
            <Trans message="Edit" />
          </Dropdown.Item>
          <Dropdown.Item onClick={handleToggleClosed}>
            {isClosed ? <CheckIcon /> : <XIcon />}
            {isClosed ? <Trans message="Reopen" /> : <Trans message="Close" />}
          </Dropdown.Item>
          <Dropdown.Item
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2Icon />
            <Trans message="Delete" />
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>
    </>
  );
}

function MobileFileRequestList({fileRequests}: {fileRequests: FileRequest[]}) {
  return (
    <Item.Group>
      {fileRequests.map(fileRequest => (
        <Item.Root key={fileRequest.id} variant="outline">
          <Item.Content>
            <Item.Title className="flex items-center gap-1.5">
              <span className="truncate">{fileRequest.title}</span>
              {fileRequest.has_password ? (
                <LockIcon
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-label="Password protected"
                />
              ) : null}
            </Item.Title>
            <Item.Row className="mt-1 gap-1 text-sm text-muted-foreground">
              <StatusBadge status={fileRequest.status} />
              <span>
                <span className="mr-1">&bull;</span>
                <Trans
                  message="[one 1 file|other :count files] received"
                  values={{count: fileRequest.uploads_count}}
                />
              </span>
            </Item.Row>
          </Item.Content>
          <Item.Actions>
            <RowActions fileRequest={fileRequest} />
          </Item.Actions>
        </Item.Root>
      ))}
    </Item.Group>
  );
}

function FileRequestsEmptyState({isFiltering}: {isFiltering: boolean}) {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <InboxIcon />
        </Empty.Media>
        <Empty.Title>
          {isFiltering ? (
            <Trans message="No matching file requests" />
          ) : (
            <Trans message="No file requests yet" />
          )}
        </Empty.Title>
        <Empty.Description>
          {isFiltering ? (
            <Trans message="Try another search query." />
          ) : (
            <Trans message="Ask anyone to upload files into a folder in your drive, no account needed." />
          )}
        </Empty.Description>
      </Empty.Header>
      {!isFiltering && (
        <Empty.Content>
          <CreateFileRequestButton />
        </Empty.Content>
      )}
    </Empty.Root>
  );
}

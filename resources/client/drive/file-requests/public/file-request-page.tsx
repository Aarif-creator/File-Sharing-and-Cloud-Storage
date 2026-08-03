import {FileRequestPasswordPage} from '@app/drive/file-requests/public/file-request-password-page';
import {FileRequestUploadPanel} from '@app/drive/file-requests/public/file-request-upload-panel';
import {getFileRequestPageData} from '@app/gen/file-requests';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {NotFoundPage} from '@common/ui/not-found-page/not-found-page';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {Alert} from '@shadcn/alert/alert';
import {Card} from '@shadcn/card/card';
import {useSuspenseQuery} from '@tanstack/react-query';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Trans} from '@ui/i18n/trans';
import {CalendarClockIcon, CircleAlertIcon, LockIcon} from 'lucide-react';
import {ReactNode, useState} from 'react';

export function Component() {
  const {hash} = useRequiredParams(['hash']);
  const [password, setPassword] = useState<string | null>(null);
  const [uploader, setUploader] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const {data} = useSuspenseQuery({
    staleTime: Infinity,
    queryKey: ['file-request-page', hash, password],
    queryFn: () => getFileRequestPageData(hash, {password}),
  });
  const isPasswordProtected = data.password_protected;
  const fileRequest = data?.data;

  if (isPasswordProtected && !password) {
    return (
      <PageWrapper>
        <FileRequestPasswordPage onPasswordMatched={setPassword} />
      </PageWrapper>
    );
  }

  if (!fileRequest) {
    return <NotFoundPage />;
  }

  return (
    <FileUploadProvider>
      <PageWrapper>
        <div className="flex flex-1 justify-center overflow-y-auto p-3.5 md:p-10">
          <div className="w-full max-w-160">
            <StaticPageTitle>{fileRequest.title}</StaticPageTitle>
            <Card>
              <Card.Header>
                <Card.Title className="text-2xl font-semibold">
                  <h1>{fileRequest.title}</h1>
                </Card.Title>
                {(fileRequest.owner_name || fileRequest.description) && (
                  <Card.Description className="flex flex-col gap-3">
                    {fileRequest.owner_name && (
                      <p>
                        <Trans
                          message=":name is requesting files from you"
                          values={{name: fileRequest.owner_name}}
                        />
                      </p>
                    )}
                    {fileRequest.description && (
                      <p className="whitespace-pre-line">
                        {fileRequest.description}
                      </p>
                    )}
                  </Card.Description>
                )}
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <RequestMeta fileRequest={fileRequest} />
                {fileRequest.accepts_uploads ? (
                  <FileRequestUploadPanel
                    fileRequest={fileRequest}
                    hash={hash}
                    password={password}
                    uploader={uploader}
                    onUploaderSubmit={setUploader}
                  />
                ) : (
                  <ClosedNotice status={fileRequest.status} />
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </FileUploadProvider>
  );
}

function PageWrapper({children}: {children: ReactNode}) {
  return (
    <div className="flex h-screen w-full flex-col bg-muted">
      <Navbar.Root className="shrink-0 border-b">
        <Navbar.Logo />
        <Navbar.Content className="ml-auto">
          <Navbar.AuthContent />
        </Navbar.Content>
      </Navbar.Root>
      {children}
    </div>
  );
}

function RequestMeta({
  fileRequest,
}: {
  fileRequest: {deadline: string | null; has_password: boolean};
}) {
  if (!fileRequest.deadline && !fileRequest.has_password) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      {fileRequest.deadline && (
        <div className="flex items-center gap-1.5">
          <CalendarClockIcon className="size-4" />
          <Trans
            message="Due :date"
            values={{date: <FormattedDate date={fileRequest.deadline} />}}
          />
        </div>
      )}
      {fileRequest.has_password && (
        <div className="flex items-center gap-1.5">
          <LockIcon className="size-4" />
          <Trans message="Password protected" />
        </div>
      )}
    </div>
  );
}

function ClosedNotice({status}: {status: string}) {
  return (
    <Alert variant="warning" fillStyle="subtleFill">
      <CircleAlertIcon />
      <Alert.Description>
        {status === 'closed' ? (
          <Trans message="This file request has been closed and is no longer accepting uploads." />
        ) : (
          <Trans message="The deadline for this file request has passed, it is no longer accepting uploads." />
        )}
      </Alert.Description>
    </Alert>
  );
}

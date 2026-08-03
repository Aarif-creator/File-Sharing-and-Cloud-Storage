import {FileRequest} from '@app/gen/schemas/file-request';
import {UploadType} from '@app/site-config';
import {BackendMetadata} from '@common/uploads/uploader/backend-metadata';
import {restrictionsFromConfig} from '@common/uploads/uploader/create-file-upload';
import {useFileUploadStore} from '@common/uploads/uploader/file-upload-provider';
import {UploadQueueItem} from '@common/uploads/uploader/ui/upload-queue-item';
import {Button} from '@shadcn/button/button';
import {Empty} from '@shadcn/empty/empty';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {openUploadWindow} from '@ui/utils/files/open-upload-window';
import {UploadedFile} from '@ui/utils/files/uploaded-file';
import {CheckCircleIcon, UploadCloudIcon} from 'lucide-react';
import {DragEvent, useState} from 'react';
import {useForm} from 'react-hook-form';

type UploaderFormValue = {
  name: string;
  email: string;
};

interface Props {
  fileRequest: FileRequest;
  hash: string;
  password: string | null;
  uploader: UploaderFormValue | null;
  onUploaderSubmit: (value: UploaderFormValue) => void;
}

export function FileRequestUploadPanel({
  fileRequest,
  hash,
  password,
  uploader,
  onUploaderSubmit,
}: Props) {
  if (!uploader) {
    return <UploaderForm onSubmit={onUploaderSubmit} />;
  }

  return (
    <UploadDropzone
      fileRequest={fileRequest}
      hash={hash}
      password={password}
      uploader={uploader}
    />
  );
}

function UploaderForm({
  onSubmit,
}: {
  onSubmit: (value: UploaderFormValue) => void;
}) {
  const form = useForm<UploaderFormValue>({
    defaultValues: {name: '', email: ''},
  });

  return (
    <HookForm.Root form={form} onSubmit={onSubmit}>
      <Field.Group>
        <HookForm.Field name="name">
          <Field.Label>
            <Trans message="Your name" />
          </Field.Label>
          <Input autoFocus required maxLength={100} />
          <Field.Error />
        </HookForm.Field>
        <HookForm.Field name="email">
          <Field.Label>
            <Trans message="Your email" />
          </Field.Label>
          <Input type="email" maxLength={180} />
          <Field.Description>
            <Trans message="Optional. Shared with the person who requested these files." />
          </Field.Description>
          <Field.Error />
        </HookForm.Field>
      </Field.Group>
      <Button type="submit" color="primary" className="mt-5 w-full">
        <Trans message="Continue" />
      </Button>
    </HookForm.Root>
  );
}

function UploadDropzone({
  fileRequest,
  hash,
  password,
  uploader,
}: {
  fileRequest: FileRequest;
  hash: string;
  password: string | null;
  uploader: UploaderFormValue;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadMultiple = useFileUploadStore(s => s.uploadMultiple);
  const startUpload = useFileUploadStore(s => s.startUpload);
  const reset = useFileUploadStore(s => s.reset);
  const fileUploads = useFileUploadStore(s => s.fileUploads);
  const uploadStarted = useFileUploadStore(s => s.uploadStarted);
  const completedUploadsCount = useFileUploadStore(
    s => s.completedUploadsCount,
  );
  const inProgressUploadsCount = useFileUploadStore(
    s => s.inProgressUploadsCount,
  );

  const isFinished =
    fileUploads.size > 0 && completedUploadsCount === fileUploads.size;
  const hasFiles = fileUploads.size > 0;
  const isUploading = uploadStarted || inProgressUploadsCount > 0;
  const pendingUploadsCount = useFileUploadStore(s => s.pendingUploadsCount);

  const handleFiles = (files: (File | UploadedFile)[] | FileList) => {
    if (!files.length) return;

    const metadata: BackendMetadata = {
      fileRequest: hash,
      uploaderName: uploader.name,
      parentId: fileRequest.folder?.id,
      workspaceId: fileRequest.workspace_id,
      ownerId: fileRequest.user_id,
    };
    if (password) {
      metadata.fileRequestPassword = password;
    }
    if (uploader.email) {
      metadata.uploaderEmail = uploader.email;
    }

    uploadMultiple(
      files,
      {
        uploadType: UploadType.bedrive,
        restrictions: restrictionsFromConfig({uploadType: UploadType.bedrive}),
        metadata,
      },
      {startUpload: false},
    );
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isFinished) return;
    handleFiles(e.dataTransfer.files);
  };

  if (isFinished) {
    return (
      <Empty className="border border-solid border-primary/30 bg-primary/2">
        <Empty.Header>
          <Empty.Media variant="icon">
            <CheckCircleIcon />
          </Empty.Media>
          <Empty.Title>
            <Trans message="Finished uploading" />
          </Empty.Title>
          <Empty.Description>
            <Trans
              message="We'll let :name know you've uploaded the files."
              values={{name: fileRequest.owner_name ?? fileRequest.title}}
            />
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button variant="default" color="primary" onClick={() => reset()}>
            <Trans message="Upload more files" />
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <div>
      {!hasFiles && (
        <Empty
          onDragOver={e => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'border-2 transition-colors',
            isDragOver ? 'border-primary bg-primary/5' : 'border-input',
          )}
        >
          <Empty.Header>
            <Empty.Media variant="icon">
              <UploadCloudIcon />
            </Empty.Media>
            <Empty.Description>
              <Trans
                message="Drop files here to send them to :name"
                values={{name: fileRequest.owner_name ?? fileRequest.title}}
              />
            </Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button
              variant="default"
              color="primary"
              onClick={async () =>
                handleFiles(await openUploadWindow({multiple: true}))
              }
            >
              <Trans message="Select files" />
            </Button>
          </Empty.Content>
        </Empty>
      )}
      {hasFiles && (
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-col gap-4"
            onDragOver={e => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {[...fileUploads.values()].map(upload => (
              <UploadQueueItem key={upload.file.id} file={upload.file} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={async () =>
                handleFiles(await openUploadWindow({multiple: true}))
              }
            >
              <Trans message="Select more files" />
            </Button>
            <Button
              variant="default"
              color="primary"
              disabled={isUploading || pendingUploadsCount === 0}
              onClick={() => startUpload()}
            >
              <Trans message="Upload" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import {getFolderPathOptions} from '@app/app-queries';
import {useLinkPageStore} from '@app/drive/shareable-link/shareable-link-page/link-page-store';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {ShareableLink} from '@app/gen/schemas/shareable-link';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {useQuery} from '@tanstack/react-query';
import {useNavigateToSubfolder} from './use-navigate-to-subfolder';

interface Props {
  folder?: DriveEntry;
  link: ShareableLink;
}
export function FolderPreviewBreadcrumb({folder, link}: Props) {
  const navigateToSubfolder = useNavigateToSubfolder();
  const password = useLinkPageStore(s => s.password);
  const query = useQuery({
    ...getFolderPathOptions(folder?.hash ?? '', {
      shareable_link: link.id.toString(),
      password,
    }),
    enabled: !!folder?.hash,
  });

  if (query.isLoading) {
    return <div className="h-9 shrink-0" />;
  } else {
    const items = query.data?.data ?? [];

    return (
      <Breadcrumb.Root className="text-lg">
        {items.flatMap((item, index) => {
          const isLast = index === items.length - 1;
          const nodes = [];

          if (index > 0) {
            nodes.push(<Breadcrumb.Separator key={`sep-${item.hash}`} />);
          }

          nodes.push(
            <Breadcrumb.Item key={item.hash}>
              {isLast ? (
                <Breadcrumb.Page>{item.name}</Breadcrumb.Page>
              ) : (
                <Breadcrumb.Button
                  onClick={() => navigateToSubfolder(item.hash)}
                >
                  {item.name}
                </Breadcrumb.Button>
              )}
            </Breadcrumb.Item>,
          );

          return nodes;
        })}
      </Breadcrumb.Root>
    );
  }
}

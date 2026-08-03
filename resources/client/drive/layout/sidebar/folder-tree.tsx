import {listWorkspaceFoldersOptions} from '@app/app-queries';
import {
  getPathForFolder,
  RootFolderPage,
} from '@app/drive/drive-page/drive-page';
import {driveState, useDriveStore} from '@app/drive/drive-store';
import {makeFolderTreeDragId} from '@app/drive/layout/sidebar/folder-tree-drag-id';
import {useSidebarTreeDropTarget} from '@app/drive/layout/sidebar/use-sidebar-tree-drop-target';
import {DriveEntry} from '@app/gen/schemas/drive-entry';
import {FileEntry} from '@app/gen/schemas/file-entry';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {mergeProps} from '@react-aria/utils';
import {useQuery} from '@tanstack/react-query';
import {
  ConnectedDraggable,
  useDraggable,
} from '@ui/interactions/dnd/use-draggable';
import {Tree} from '@ui/tree/tree';
import {TreeItem, TreeItemProps} from '@ui/tree/tree-item';
import clsx from 'clsx';
import {FolderIcon, HomeIcon} from 'lucide-react';
import {arrayToTree} from 'performant-array-to-tree';
import {useMemo, useRef} from 'react';

interface TreeFolder extends DriveEntry {
  children: TreeFolder[];
}

export function FolderTree() {
  const navigate = useNavigate();
  const {data} = useQuery(listWorkspaceFoldersOptions());
  const expandedKeys = useDriveStore(s => s.sidebarExpandedKeys);

  const activePage = useDriveStore(s => s.activePage);
  let selectedKeys: number[] = [];
  if (activePage?.isFolderPage) {
    selectedKeys = activePage.folder ? [activePage.folder.id] : [];
  }

  const tree = useMemo(() => {
    const folders = arrayToTree(data?.data || [], {
      parentId: 'parent_id',
      dataField: null,
    }) as TreeFolder[];
    const rootFolder = {
      ...RootFolderPage.folder,
      children: folders,
    };
    return [rootFolder];
  }, [data?.data]);

  return (
    <Tree
      nodes={tree}
      expandedKeys={expandedKeys}
      onExpandedKeysChange={keys => {
        driveState().setSidebarExpandedKeys(keys);
      }}
      selectedKeys={selectedKeys}
      onSelectedKeysChange={([id]) => {
        const entryHash = findHash(id as number, tree);
        if (entryHash) {
          navigate(getPathForFolder(entryHash));
        } else {
          navigate(RootFolderPage.path);
        }
      }}
    >
      {() => <FolderTreeItem />}
    </Tree>
  );
}

// props will be passed by tree via cloneElement
function FolderTreeItem(props: Partial<TreeItemProps<TreeFolder>>) {
  const {node} = props as Required<TreeItemProps<TreeFolder>>;
  const labelRef = useRef<HTMLDivElement>(null);
  const isRootFolder = node.id === 0;
  const isDragging = useDriveStore(s =>
    s.entriesBeingDragged.includes(node.id),
  );

  const {draggableProps} = useDraggable({
    type: 'fileEntry',
    id: makeFolderTreeDragId(node),
    ref: labelRef,
    disabled: isRootFolder,
    hidePreview: true,
    onDragStart: (e, draggable) => {
      const d = draggable as ConnectedDraggable<FileEntry[]>;
      driveState().setEntriesBeingDragged(d.getData().map(e => e.id));
      driveState().selectEntries([]);
    },
    onDragEnd: () => {
      driveState().setEntriesBeingDragged([]);
    },
    getData: () => [node],
  });

  const {droppableProps, isDragOver} = useSidebarTreeDropTarget({
    folder: node,
    ref: labelRef,
  });

  return (
    <TreeItem
      {...mergeProps(draggableProps, droppableProps, props)}
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
        driveState().deselectEntries('all');
        driveState().setContextMenuData({
          x: e.clientX,
          y: e.clientY,
          entry: node,
        });
      }}
      labelRef={labelRef}
      labelClassName={clsx(
        'mb-0.5 h-9',
        isDragOver && 'bg-sidebar-accent',
        isDragging && 'opacity-30',
      )}
      icon={isRootFolder ? <HomeIcon /> : <FolderIcon />}
      label={node.name}
    />
  );
}

const findHash = (id: number, nodes: TreeFolder[]): string | undefined => {
  for (const item of nodes) {
    if (item.id === id) {
      return item.hash;
    } else if ('children' in item) {
      const hash = findHash(id, item.children ?? []);
      if (hash) {
        return hash;
      }
    }
  }
};

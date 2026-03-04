import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { fetchPaginatedFolders } from "../api/apiCall";
import type { FileItemDTO } from "../types/FileManagerTypes";
import {
  useFolderTreeContext,
  type BreadcrumbItem,
} from "../context/FolderTreeContext";

interface FolderPage {
  folders: FileItemDTO[];
  hasNextPage: boolean;
  continuanceToken?: string | null;
}

/**
 * Props for the recursive Folder component.
 *
 * This component renders a single folder node in the tree and recursively renders
 * its children when expanded. It handles lazy loading, pagination, search filtering,
 * breadcrumb synchronization, selection highlighting, and ghost-folder insertion
 * for path consistency.
 */
interface FolderProps {
  folderId: string;
  folderName: string;
  defaultExpanded?: boolean;
  pageSize?: number;
  level?: number;
  parentBreadcrumbs?: BreadcrumbItem[];
}

const toPageNumber = (value: string | number | null | undefined) => {
  const page = Number(value);
  return Number.isFinite(page) ? page : null;
};

const loadFolderPage = async (
  folderId: string,
  pageNum: number,
  pageSize: number,
  searchTerm: string,
): Promise<FolderPage> => {
  const response = (await fetchPaginatedFolders(
    folderId,
    pageNum,
    pageSize,
    searchTerm,
  )) as Partial<FolderPage>;

  return {
    folders: response.folders ?? [],
    hasNextPage: Boolean(response.hasNextPage),
    continuanceToken: response.continuanceToken ?? null,
  };
};
/**
 * Recursive folder tree node component.
 *
 * Features:
 * • Click to select folder → updates global selectedFolderId
 * • Chevron to expand/collapse children
 * • Infinite scrolling / pagination ("Load more")
 * • Search term synchronization (debounced from global search)
 * • Breadcrumb trail maintenance
 * • "Ghost folder" insertion – shows next folder in breadcrumb path even if not yet loaded
 * • Caches discovered children in context to avoid re-fetching
 * • Visual highlighting when selected
 * • Indentation based on nesting level
 *
 * @remarks
 * This component is performance-sensitive:
 * - useInfiniteQuery is only enabled when expanded
 * - knownFolders cache prevents redundant API calls
 * - Memoization is used aggressively on computed lists
 */
const Folder = ({
  folderId,
  folderName,
  defaultExpanded = false,
  pageSize = 5,
  level = 0,
  parentBreadcrumbs = [],
}: FolderProps) => {
  const {
    selectedFolderId,
    setSelectedFolderId,
    breadcrumbs,
    setBreadcrumbs,
    folderSearchText,
    knownFolders,
    addDiscoveredFolders,
  } = useFolderTreeContext();

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [innerSearchTerm, setInnerSearchTerm] = useState("");
  const [discoveredFolders, setDiscoveredFolders] = useState<FileItemDTO[]>([]);
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["folder-children", folderId, innerSearchTerm, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      loadFolderPage(
        folderId,
        toPageNumber(pageParam) ?? 0,
        pageSize,
        innerSearchTerm,
      ),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNextPage) {
        return undefined;
      }

      return toPageNumber(lastPage.continuanceToken);
    },
    enabled: expanded,
  });
  useEffect(() => {
    if (data?.pages) {
      const allFetched = data.pages.flatMap((page) => page.folders);
      if (allFetched.length > 0) {
        addDiscoveredFolders(folderId, allFetched);
      }
    }
  }, [data, folderId]);
  const currentBreadcrumbs = useMemo(() => {
    return [
      ...parentBreadcrumbs,
      {
        title: folderName,
        id: folderId,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, folderName, JSON.stringify(parentBreadcrumbs)]);

  console.log("Current breadcrumbs", currentBreadcrumbs);
  const childFolders = useMemo(() => {
    const remembered = knownFolders[folderId] ?? [];

    const currentIndex = breadcrumbs.findIndex((b) => b.id === folderId);
    const nextFolderInPath =
      currentIndex !== -1 ? breadcrumbs[currentIndex + 1] : null;

    const finalFolders = [...remembered];

    if (nextFolderInPath) {
      const alreadyExists = finalFolders.some(
        (f) => f.id === nextFolderInPath.id,
      );
      if (!alreadyExists && nextFolderInPath.id !== folderId) {
        finalFolders.push({
          id: nextFolderInPath.id,
          name: nextFolderInPath.title,
          type: "folder",
        });
      }
    }

    return finalFolders;
  }, [knownFolders, breadcrumbs, folderId]);

  // WORKING
  // const childFolders = useMemo(() => {
  //   const fetchedFolders = data?.pages.flatMap((page) => page.folders) ?? [];

  //   const currentIndex = breadcrumbs.findIndex((b) => b.id === folderId);

  //   if (currentIndex !== -1) {
  //     const nextFolderInPath = breadcrumbs[currentIndex + 1];

  //     if (
  //       nextFolderInPath &&
  //       !fetchedFolders.some((f) => f.id === nextFolderInPath.id)
  //     ) {
  //       if (nextFolderInPath.id !== folderId) {
  //         const ghostFolder: FileItemDTO = {
  //           id: nextFolderInPath.id,
  //           name: nextFolderInPath.title,
  //           type: "folder",
  //         };
  //         return [...fetchedFolders, ghostFolder];
  //       }
  //     }
  //   }

  //   return fetchedFolders;
  // }, [data, breadcrumbs, folderId]);

  const isSelected = selectedFolderId === folderId;

  useEffect(() => {
    if (!(expanded && selectedFolderId === folderId)) {
      if (expanded && innerSearchTerm) {
        setInnerSearchTerm(""); // reset search term when collapsing or selecting another folder
      }
      return; // only set search term if this folder is expanded and selected
    }

    const timeout = setTimeout(() => {
      setInnerSearchTerm(folderSearchText);
    }, 300); // debounce delay

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderSearchText, expanded, selectedFolderId, folderId]);

  useEffect(() => {
    if (selectedFolderId == folderId) {
      const currentIndexInGlobal = breadcrumbs.findIndex(
        (b) => b.id === folderId,
      );
      if (
        currentIndexInGlobal === -1 ||
        currentIndexInGlobal !== breadcrumbs.length - 1
      ) {
        setBreadcrumbs(currentBreadcrumbs);
      }
      // setBreadcrumbs(currentBreadcrumbs);
      setExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, selectedFolderId, currentBreadcrumbs, setBreadcrumbs]);

  const isChildSelected = useMemo(() => {
    return breadcrumbs.some((i) => i.id == folderId);
  }, [breadcrumbs, folderId]);

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1  cursor-pointer ${isSelected ? "font-semibold text-blue-600 bg-blue-100 hover:bg-blue-100 rounded-md " : "text-slate-700 hover:bg-neutral-50"} hover:cursor-pointer`}
        style={{ paddingLeft: `${level * 14}px` }}
        onClick={() => {
          setSelectedFolderId(folderId);
        }}
      >
        <Button
          type="text"
          size="small"
          style={{
            color: "inherit",
          }}
          onClick={() => {
            if (!isChildSelected) {
              setExpanded((prev) => !prev);
            }
          }}
        >
          {expanded ? "▾" : "▸"}
        </Button>
        <button
          type="button"
          className={`text-left text-sm hover:cursor-pointer`}
          onClick={() => {
            setExpanded(true);
            setSelectedFolderId(folderId);
          }}
        >
          {folderName}
        </button>
      </div>

      {expanded && (
        <div>
          {isLoading && (
            <div
              className="py-1"
              style={{ paddingLeft: `${(level + 1) * 16}px` }}
            >
              <Spin size="small" />
            </div>
          )}

          {isError && (
            <div
              className="text-xs text-red-500 py-1"
              style={{ paddingLeft: `${(level + 1) * 16}px` }}
            >
              Failed to load folders.
            </div>
          )}

          {childFolders.map((subFolder) => (
            <Folder
              key={subFolder.id}
              folderId={subFolder.id}
              folderName={subFolder.name}
              pageSize={pageSize}
              level={level + 1}
              parentBreadcrumbs={currentBreadcrumbs}
              // breadcrumbs={[...breadcrumb, {
              //   id:,
              //   file
              // }}
              // defaultExpanded
            />
          ))}
          {childFolders.length === 0 && !isLoading && (
            <div
              className="text-xs text-gray-500 py-1"
              style={{ paddingLeft: `${(level + 1) * 16}px` }}
            >
              No folders found.
            </div>
          )}
          {hasNextPage && (
            <div
              className="py-1"
              style={{ paddingLeft: `${(level + 1) * 16}px` }}
            >
              <Button
                size="small"
                type="default"
                loading={isFetchingNextPage}
                onClick={() => {
                  fetchNextPage();
                }}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Folder;

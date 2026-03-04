import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { FileItemDTO } from "../types/FileManagerTypes";

interface FolderTreeContextValue {
  selectedFolderId: string | null;
  setSelectedFolderId: Dispatch<SetStateAction<string | null>>;
  folderSearchText: string;
  setFolderSearchText: Dispatch<SetStateAction<string>>;
}

interface FolderTreeProviderProps {
  children: ReactNode;
  initialSelectedFolderId?: string | null;
  initialFolderSearchText?: string;
}

export interface BreadcrumbItem {
  id: string;
  title: string;
}
interface FolderTreeContextValue {
  selectedFolderId: string | null;
  setSelectedFolderId: Dispatch<SetStateAction<string | null>>;

  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: Dispatch<SetStateAction<BreadcrumbItem[]>>;

  folderSearchText: string;
  setFolderSearchText: Dispatch<SetStateAction<string>>;

  knownFolders: Record<string, FileItemDTO[]>;
  addDiscoveredFolders: (parentId: string, folders: FileItemDTO[]) => void;
}
const FolderTreeContext = createContext<FolderTreeContextValue | undefined>(
  undefined,
);
/**
 * Provider component that holds and shares folder navigation state.
 *
 * Main responsibilities:
 * - Selected folder tracking
 * - Breadcrumb path management
 * - Folder search/filter state
 * - Lazy-loaded child folders caching (avoid duplicate fetches)
 */
export const FolderTreeProvider = ({
  children,
  initialSelectedFolderId = null,
  initialFolderSearchText = "",
}: FolderTreeProviderProps) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    initialSelectedFolderId,
  );
  const [folderSearchText, setFolderSearchText] = useState(
    initialFolderSearchText,
  );
  const [knownFolders, setKnownFolders] = useState<
    Record<string, FileItemDTO[]>
  >({});
  const addDiscoveredFolders = (parentId: string, folders: FileItemDTO[]) => {
    setKnownFolders((prev) => {
      const existing = prev[parentId] || [];
      const folderMap = new Map(
        [...existing, ...folders].map((f) => [f.id, f]),
      );
      return { ...prev, [parentId]: Array.from(folderMap.values()) };
    });
  };
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const value = useMemo(
    () => ({
      selectedFolderId,
      setSelectedFolderId,
      folderSearchText,
      setFolderSearchText,
      breadcrumbs,
      setBreadcrumbs,
      knownFolders,
      addDiscoveredFolders,
    }),
    [selectedFolderId, folderSearchText, breadcrumbs, knownFolders],
  );

  return (
    <FolderTreeContext.Provider value={value}>
      {children}
    </FolderTreeContext.Provider>
  );
};

/**
 * Custom hook to access folder tree context values and actions.
 *
 * @throws {Error} When used outside of FolderTreeProvider
 *
 * @example
 * ```tsx
 * const {
 *   selectedFolderId,
 *   setSelectedFolderId,
 *   breadcrumbs,
 *   addDiscoveredFolders
 * } = useFolderTreeContext();
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useFolderTreeContext = () => {
  const context = useContext(FolderTreeContext);

  if (!context) {
    throw new Error(
      "useFolderTreeContext must be used within a FolderTreeProvider",
    );
  }

  return context;
};

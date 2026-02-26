import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

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
}
const FolderTreeContext = createContext<FolderTreeContextValue | undefined>(
  undefined,
);

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

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const value = useMemo(
    () => ({
      selectedFolderId,
      setSelectedFolderId,
      folderSearchText,
      setFolderSearchText,
      breadcrumbs,
      setBreadcrumbs,
    }),
    [selectedFolderId, folderSearchText, breadcrumbs],
  );

  return (
    <FolderTreeContext.Provider value={value}>
      {children}
    </FolderTreeContext.Provider>
  );
};

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

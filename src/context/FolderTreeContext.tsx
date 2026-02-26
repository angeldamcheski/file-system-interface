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

  const value = useMemo(
    () => ({
      selectedFolderId,
      setSelectedFolderId,
      folderSearchText,
      setFolderSearchText,
    }),
    [selectedFolderId, folderSearchText],
  );

  return (
    <FolderTreeContext.Provider value={value}>
      {children}
    </FolderTreeContext.Provider>
  );
};

export const useFolderTreeContext = () => {
  const context = useContext(FolderTreeContext);

  if (!context) {
    throw new Error(
      "useFolderTreeContext must be used within a FolderTreeProvider",
    );
  }

  return context;
};

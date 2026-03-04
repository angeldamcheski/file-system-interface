import { fetchRootFolder } from "../api/apiCall";
import { useQuery } from "@tanstack/react-query";
import Folder from "./Folder";
import Search from "antd/es/input/Search";
import { useFolderTreeContext } from "../context/FolderTreeContext";
import { useEffect } from "react";
/**
 * Top-level panel that manages the folder tree view.
 *
 * Responsibilities:
 * - Fetches the root folder via API
 * - Sets the initially selected folder (root) when data arrives
 * - Provides a search input to filter folders in the tree
 * - Renders the root {@link Folder} component (which recursively renders children)
 *
 * This component serves as the entry point for the folder navigation UI.
 */
const FolderPanelManager = () => {
  const {
    data: rootFolder,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rootFolder"],
    queryFn: fetchRootFolder,
  });
  const { folderSearchText, setFolderSearchText } = useFolderTreeContext();

  const { setSelectedFolderId } = useFolderTreeContext();

  useEffect(() => {
    if (!rootFolder) return;

    setSelectedFolderId(rootFolder?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootFolder]);

  return (
    <div>
      <div>
        <Search
          placeholder="Search folders"
          style={{ marginBottom: 8 }}
          onChange={(e) => setFolderSearchText(e.target.value)}
          value={folderSearchText}
        />
      </div>

      {rootFolder ? (
        <Folder
          folderId={rootFolder.id}
          defaultExpanded
          pageSize={5}
          folderName={rootFolder.name}
          level={0} // root level
          parentBreadcrumbs={[]}
        />
      ) : isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {JSON.stringify(error)}</div>
      ) : (
        "NOTHING WORKS"
      )}
    </div>
  );
};

export default FolderPanelManager;

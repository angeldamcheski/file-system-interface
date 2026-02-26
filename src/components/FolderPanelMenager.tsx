import { fetchRootFolder } from "../api/apiCall";
import { useQuery } from "@tanstack/react-query";
import Folder from "./Folder";
import Search from "antd/es/input/Search";
import { useFolderTreeContext } from "../context/FolderTreeContext";

const FolderPanelMenager = () => {
  const {
    data: rootFolder,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rootFolder"],
    queryFn: fetchRootFolder,
  });
  const { folderSearchText, setFolderSearchText } = useFolderTreeContext();
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

export default FolderPanelMenager;

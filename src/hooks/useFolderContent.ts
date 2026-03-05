import { useQuery } from "@tanstack/react-query";
import { fetchPaginatedFolderContent } from "../api/apiCall";
import type { FileItemDTO } from "../types/FileManagerTypes";

export const useFolderContent = (
  selectedFolderId: string | null,
  currentPage: number,
  pageSize: number,
  searchTerm: string,
) => {
  return useQuery({
    queryKey: [
      "folderContent",
      selectedFolderId,
      currentPage,
      pageSize,
      searchTerm,
    ],
    queryFn: () =>
      fetchPaginatedFolderContent(
        selectedFolderId,
        currentPage - 1,
        pageSize,
        searchTerm,
      ),
    // staleTime: 1000 * 60 * 5,
    // cacheTime: 1000 * 60 * 30,
    enabled: !!selectedFolderId,
    placeholderData: (previousData: FileItemDTO[]) => previousData,
  });
};

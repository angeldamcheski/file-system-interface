// hooks/useAdvancedFileSearch.ts
import { useQuery } from "@tanstack/react-query";
import { advancedFileSearch } from "../api/apiCall";
import type { FolderContentDTO } from "../types/FileManagerTypes";
import type {
  SearchCriterionDTO,
  SearchRequestDTO,
} from "../types/AdvancedSearchTypes";

interface UseAdvancedFileSearchParams {
  searchCriteria: SearchCriterionDTO[];
  currentPage: number;
  pageSize: number;
  enabled?: boolean; // optional, defaults to true
}

export const useAdvancedFileSearch = ({
  searchCriteria,
  currentPage,
  pageSize,
  enabled = true,
}: UseAdvancedFileSearchParams) => {
  const query = useQuery<FolderContentDTO>({
    queryKey: ["advancedFileSearch", searchCriteria, currentPage, pageSize],
    queryFn: () => {
      if (!searchCriteria.length) {
        // return empty structure when no search criteria
        return { folders: [], files: [], totalCount: 0 };
      }

      const request: SearchRequestDTO = {
        baseClassName: "Document",
        criteria: searchCriteria,
        andSearch: true,
        pageSize,
        pageNumber: currentPage - 1, // backend is 0-based
      };

      return advancedFileSearch(request);
    },
    enabled,
    keepPreviousData: true,
  });

  return query;
};

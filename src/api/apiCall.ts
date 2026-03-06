import axios from "axios";
import type { FileItemDTO, FolderContentDTO } from "../types/FileManagerTypes";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});
/**
 * Fetches the complete content (files + subfolders) of a folder.
 * Returns everything in one response — **not paginated**.
 *
 * @param parentId - Optional folder ID whose contents to fetch.
 *                   If omitted or null → fetches root folder contents.
 * @returns ```FolderContentDTO``` containing items and possibly metadata
 * @deprecated Consider using the paginated version (`fetchPaginatedFolderContent`)
 *             for better performance with large folders.
 */
export const fetchFolderContent = async (
  parentId?: string | null,
): Promise<FolderContentDTO> => {
  const response = await apiClient.get<FolderContentDTO>("/contents", {
    params: parentId ? { parentId } : {},
  });
  return response.data;
};
/**
 * Fetches the root folder metadata (the top-level folder itself).
 *
 * @returns FileItemDTO representing the root folder
 */
export const fetchRootFolder = async (): Promise<FileItemDTO> => {
  const response = await apiClient.get<FileItemDTO>("/");
  return response.data;
};
/**
 * Fetches a paginated list of **both files and folders** inside a given folder.
 * Used mainly for the main content table in the File Manager UI.
 *
 * @param folderId   - ID of the parent folder (null/undefined for root)
 * @param pageNum    - 0-based page index (default: 0)
 * @param pageSize   - Number of items per page (default: 10)
 * @returns Paginated response containing items, total count, etc.
 */
export const fetchPaginatedFolderContent = async (
  folderId: string | null,
  pageNum: number = 0,
  pageSize: number | null = 10,
  searchTerm: string = "",
) => {
  const response = await apiClient.get("/list-paginated", {
    params: {
      parentId: folderId,
      pageSize: pageSize,
      pageNum: pageNum,
      searchTerm: searchTerm,
    },
  });
  return response.data;
};
/**
 * Fetches a paginated list of **only subfolders** (no files) of a given folder.
 * Used by the folder tree component (`Folder.tsx`) for lazy-loading children.
 *
 * Supports server-side search filtering via `searchTerm`.
 *
 * @param parentId    - ID of the parent folder (null for root)
 * @param pageNum     - 0-based page index (default: 0)
 * @param pageSize    - Items per page (default: 5 — tree usually shows few at a time)
 * @param searchTerm  - Optional filter to search folder names (default: "")
 * @returns ```Object containing:
 *          - folders: FileItemDTO[]
 *          - hasNextPage: boolean
 *          - continuanceToken?: string | null (for next page)
 */
export const fetchPaginatedFolders = async (
  parentId: string | null,
  pageNum: number = 0,
  pageSize: number | null = 5,
  searchTerm: string = "",
) => {
  const response = await apiClient.get("/paginated-folders", {
    params: { parentId, pageNum, pageSize, searchTerm },
  });

  return response.data;
};
/**
 * Downloads or streams the binary content of a file/document.
 * Returns an Axios response with `responseType: 'blob'`.
 *
 * Used for previewing (images, PDFs) or downloading files.
 *
 * @param documentId   - Unique ID of the file/document
 * @param disposition  - HTTP Content-Disposition:
 *                       "inline"  → preview/stream in browser
 *                       "attachment" → force download
 *                       Default: "inline"
 * @returns Axios response containing the Blob
 */
export const fetchFileContent = async (
  documentId: string,
  disposition: "inline" | "attachment" = "inline",
) => {
  const response = await apiClient.get("/files/content", {
    params: { documentId, disposition },
    responseType: "blob",
  });

  return response;
};

//@Legacy Not used anymore
// export const fetchPaginatedFolderContent = async (
//   folderId: string | null,
//   pageNum: number = 0,
//   pageSize: number | null = 10,
// ) => {
//   const response = await apiClient.get("/paginated-contents", {
//     params: {
//       parentId: folderId,
//       pageSize: pageSize,
//       pageNum: pageNum,
//     },
//   });
//   return response.data;
// };

export const fetchFolderPath = async (
  folderId: string | null,
): Promise<
  {
    Id: string; // TODo change to id
    folderName: string;
  }[]
> => {
  const response = await apiClient.get<
    {
      Id: string; // TODo change to id
      folderName: string;
    }[]
  >("/get-path", {
    params: { folderId },
  });
  return response.data;
};

export const uploadFile = async (
  folderId: string,
  file: File,
): Promise<FileItemDTO> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<FileItemDTO>(
    `/${folderId}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
export const updateFileVersion = async (docId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.put(`/${docId}/version`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
/**
 * Fetches the version history for a specific document.
 * @param docId - The ID of the document
 * @returns List of FileItemDTO representing different versions
 */
export const fetchFileVersions = async (
  docId: string,
): Promise<FileItemDTO[]> => {
  const response = await apiClient.get<FileItemDTO[]>(`/${docId}/versions`);
  return response.data;
};

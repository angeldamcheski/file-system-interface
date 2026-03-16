import axios from "axios";
import type { FileItemDTO, FolderContentDTO } from "../types/FileManagerTypes";
import type { SearchRequestDTO } from "../types/AdvancedSearchTypes";

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

/**
 * Fetches the full path of a folder from the backend given its ID.
 *
 * <p>Returns an array of objects representing each folder in the path from the root to
 * the specified folder, including folder ID and name.
 *
 * @param folderId - The unique ID of the folder whose path should be fetched. Can be null.
 * @returns A Promise that resolves to an array of objects, each containing:
 *          - Id: string (the folder's unique ID)
 *          - folderName: string (the name of the folder)
 */
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

/**
 * Uploads a file to a specified folder on the backend.
 *
 * <p>The file is sent as multipart/form-data to the API.
 *
 * @param folderId - The unique ID of the folder where the file should be uploaded
 * @param file - The {@link File} object to be uploaded
 * @returns A Promise that resolves to a {@link FileItemDTO} representing the uploaded file,
 *          including properties like id, name, type, size, and modified date
 */
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

/**
 * Updates an existing file by creating a new version on the backend.
 *
 * <p>The file is sent as multipart/form-data, and the backend will create a new version
 * of the document identified by the given docId.
 *
 * @param docId - The unique ID of the document to update
 * @param file - The {@link File} object containing the new version content
 * @returns A Promise that resolves to the response data from the backend, typically
 *          a {@link FileItemDTO} representing the updated version
 */
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
/**
 * Creates a folder in the current directory
 * @param parentId - The id of the current folder
 * @param folderName - The name of the new folder
 * @returns FileItemDTO of the folder we created
 */
export const createFolder = async (
  parentId: string | null,
  folderName: string,
): Promise<FileItemDTO> => {
  if (!folderName.trim()) {
    throw new Error("Folder name cannot be empty");
  }

  const response = await apiClient.post<FileItemDTO>("/folders-create", null, {
    params: {
      parentId,
      folderName,
    },
  });
  return response.data;
};
export const deleteFolderRecursive = async (
  folderId: string,
): Promise<void> => {
  await apiClient.delete(`/${folderId}/delete`);
};
export const renameFolder = async (
  folderId: string,
  newName: string,
): Promise<FileItemDTO> => {
  const response = await apiClient.patch<FileItemDTO>(
    `/${folderId}/rename`,
    null,
    {
      params: { newName },
    },
  );
  return response.data;
};

/**
 * Renames a file in the backend.
 */
export const renameFile = async (
  fileId: string,
  newName: string,
): Promise<FileItemDTO> => {
  const response = await apiClient.patch<FileItemDTO>(
    `/files/${fileId}/rename`,
    null,
    {
      params: { newName },
    },
  );
  return response.data;
};

/**
 * Deletes a file in the backend.
 */
export const deleteFile = async (fileId: string): Promise<void> => {
  await apiClient.delete(`/files/${fileId}`);
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

export const advancedFileSearch = async (
  request: SearchRequestDTO,
): Promise<FolderContentDTO> => {
  const response = await apiClient.post<FolderContentDTO>(
    "/api/search",
    request,
  );
  return response.data;
};

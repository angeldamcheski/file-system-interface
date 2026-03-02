import axios from "axios";
import type { FileItemDTO, FolderContentDTO } from "../types/FileManagerTypes";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchFolderContent = async (
  parentId?: string | null,
): Promise<FolderContentDTO> => {
  const response = await apiClient.get<FolderContentDTO>("/contents", {
    params: parentId ? { parentId } : {},
  });
  return response.data;
};

export const fetchRootFolder = async (): Promise<FileItemDTO> => {
  const response = await apiClient.get<FileItemDTO>("/");
  return response.data;
};

export const fetchPaginatedFolderContent = async (
  folderId: string | null,
  pageNum: number = 0,
  pageSize: number | null = 10,
) => {
  const response = await apiClient.get("/list-paginated", {
    params: {
      parentId: folderId,
      pageSize: pageSize,
      pageNum: pageNum,
    },
  });
  console.log("LIST PAGINATED", response);
  return response.data;
};

export const fetchPaginatedFolders = async (
  parentId: string | null,
  pageNum: number = 0,
  pageSize: number | null = 5,
  searchTerm: string = "",
) => {
  const response = await apiClient.get("/paginated-folders", {
    params: { parentId, pageNum, pageSize, searchTerm },
  });
  console.log("Paginated folders response", response.data);
  return response.data;
};

export const fetchFileContent = async (
  documentId: string,
  disposition: "inline" | "attachment" = "inline",
) => {
  const response = await apiClient.get("/files/content", {
    params: { documentId, disposition },
    responseType: "blob",
  });
  console.log("BLOB RESPONSE: ", response.data);
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

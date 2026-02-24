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
  const response = await apiClient.get("/paginated-contents", {
    params: {
      parentId: folderId,
      pageSize: pageSize,
      pageNum: pageNum,
    },
  });
  return response.data;
};

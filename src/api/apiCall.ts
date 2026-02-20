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

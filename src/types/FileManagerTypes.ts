export interface FileItemDTO {
  id: string;
  name: string;
  type: "folder" | "file";
}

export interface FolderContentDTO {
  folders: FileItemDTO[];
  files: FileItemDTO[];
}

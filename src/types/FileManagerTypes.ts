export interface FileItemDTO {
  id: string;
  name: string;
  type: "folder" | "file";
  modifiedDate?: string;
  createdDate?: string;
}

export interface FolderContentDTO {
  folders: FileItemDTO[];
  files: FileItemDTO[];
  totalCount: number;
}

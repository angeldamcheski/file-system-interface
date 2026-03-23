export interface FileMetadataPropertyDTO {
  key: string;
  label: string;
  value: string;
  type?: string; // optional (text, date, number, user...)
}

export interface FileMetadataDTO {
  id: string;
  name: string;
  properties: FileMetadataPropertyDTO[];
}

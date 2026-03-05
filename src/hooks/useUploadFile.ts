import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FileItemDTO } from "../types/FileManagerTypes";
import { updateFileVersion, uploadFile } from "../api/apiCall";
import { message, Modal } from "antd";
export const useUploadFile = (
  selectedFolderId: string,
  tableData: FileItemDTO[],
) => {
  const queryClient = useQueryClient();

  const versionMutation = useMutation({
    mutationFn: ({ docId, file }: { docId: string; file: File }) =>
      updateFileVersion(docId, file),
    onSuccess: () => {
      message.success("New version uploaded successfully");
      queryClient.invalidateQueries({
        queryKey: ["folderContent", selectedFolderId],
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ folderId, file }: { folderId: string; file: File }) =>
      uploadFile(folderId, file),

    onSuccess: () => {
      message.success("File uploaded successfully");
      queryClient.invalidateQueries({
        queryKey: ["folderContent", selectedFolderId],
      });
    },

    onError: (error: any, variables) => {
      if (error.response?.status === 409) {
        const existingFile = tableData.find(
          (item) =>
            item.name.toLowerCase() === variables.file.name.toLowerCase(),
        );

        Modal.confirm({
          title: "File already exists",
          content: `Upload new version of ${variables.file.name}?`,
          onOk: () => {
            if (existingFile) {
              versionMutation.mutate({
                docId: existingFile.id,
                file: variables.file,
              });
            }
          },
        });
      } else {
        message.error("Upload failed");
      }
    },
  });

  return uploadMutation;
};

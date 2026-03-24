import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { renameFolder } from "../api/apiCall";

export const useRenameFolder = (selectedFolderId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      folderId,
      newName,
    }: {
      folderId: string;
      newName: string;
    }) => renameFolder(folderId, newName),
    onSuccess: () => {
      message.success("Folder renamed successfully");
      queryClient.invalidateQueries({
        queryKey: ["folderContent", selectedFolderId],
      });
      queryClient.invalidateQueries({ queryKey: ["paginated-folders"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const msg =
        error.response?.status === 409
          ? "A folder with this name already exists"
          : "Failed to rename folder";
      message.error(msg);
    },
  });
};

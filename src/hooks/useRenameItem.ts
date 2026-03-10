import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { renameFile, renameFolder } from "../api/apiCall";
import type { FileItemDTO } from "../types/FileManagerTypes";

export const useRenameItem = (selectedFolderId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ item, newName }: { item: FileItemDTO; newName: string }) => {
      return item.type === "folder"
        ? renameFolder(item.id, newName)
        : renameFile(item.id, newName);
    },

    onSuccess: () => {
      message.success("Renamed successfully");

      queryClient.invalidateQueries({
        queryKey: ["folderContent", selectedFolderId],
      });

      queryClient.invalidateQueries({
        queryKey: ["paginated-folders"],
      });
    },

    onError: (error: any) => {
      const msg =
        error.response?.status === 409
          ? "An item with this name already exists"
          : "Rename failed";

      message.error(msg);
    },
  });
};

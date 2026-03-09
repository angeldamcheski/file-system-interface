import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, message } from "antd";
import { deleteFile, deleteFolderRecursive } from "../api/apiCall";
import type { FileItemDTO } from "../types/FileManagerTypes";

export const useDeleteItem = (selectedFolderId: string | null) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (item: FileItemDTO) =>
      item.type === "folder"
        ? deleteFolderRecursive(item.id)
        : deleteFile(item.id),

    onSuccess: () => {
      message.success("Deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["folderContent"],
      });

      queryClient.invalidateQueries({
        queryKey: ["paginated-folders"],
      });
    },
  });

  const confirmDelete = (item: FileItemDTO) => {
    Modal.confirm({
      title: `Delete "${item.name}"?`,
      content:
        item.type === "folder"
          ? "This will delete all files and subfolders."
          : "This will permanently delete the file.",
      okText: "Delete",
      okType: "danger",
      onOk: () => mutation.mutate(item),
    });
  };

  return {
    confirmDelete,
    deleting: mutation.isPending,
  };
};

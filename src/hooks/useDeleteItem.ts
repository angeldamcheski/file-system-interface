import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, message } from "antd";
import { deleteFile, deleteFolderRecursive } from "../api/apiCall";
import type { FileItemDTO } from "../types/FileManagerTypes";
import { useState } from "react";

export const useDeleteItem = (selectedFolderId: string | null) => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (item: FileItemDTO) => {
      setDeletingId(item.id);
      if (item.type === "folder") {
        await deleteFolderRecursive(item.id);
      } else {
        await deleteFile(item.id);
      }
    },
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      message.success("Deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["folderContent", selectedFolderId],
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
    deletingId,
    deleting: mutation.isPending,
  };
};

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Modal } from "antd";
import { deleteFolderRecursive } from "../api/apiCall";
import type { FileItemDTO } from "../types/FileManagerTypes";

export const useDeleteFolder = (selectedFolderId: string | null) => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (folderId: string) => deleteFolderRecursive(folderId),
    onMutate: (folderId) => {
      setDeletingId(folderId);
    },
    onSuccess: () => {
      message.success("Folder and its contents deleted successfully.");

      queryClient.invalidateQueries({
        queryKey: ["folderContent", selectedFolderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["paginated-folders"],
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Delete error:", error);
      message.error(
        error.response?.data?.message || "Failed to delete folder hierarchy.",
      );
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const confirmDelete = (record: FileItemDTO) => {
    Modal.confirm({
      title: `Delete "${record.name}"?`,
      content:
        "This will delete all subfolders and documents inside. This action is permanent.",
      okText: "Delete Everything",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        deleteMutation.mutate(record.id);
      },
    });
  };

  return {
    confirmDelete,
    isDeleting: !!deletingId,
    deletingId,
  };
};

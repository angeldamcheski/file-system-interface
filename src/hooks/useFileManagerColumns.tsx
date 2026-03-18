import { Button, Space, Spin, type MenuProps } from "antd";
import type { FileItemDTO } from "../types/FileManagerTypes";
import {
  FolderOpenOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  FolderOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getFileIcon, handleFileOpen } from "../utils/fileManagerUtils";
interface ColumnProps {
  setSelectedFolderId: (id: string) => void;
  setCurrentPage: (page: number) => void;
  openPreview: (url: string, type: string, name: string) => void;
  handleViewVersions: (record: FileItemDTO) => void;
  confirmDelete: (record: FileItemDTO) => void;
  setRenamingFolder: (record: FileItemDTO) => void;
  setNewName: (name: string) => void;
  deletingId: string | null;
  isDeleting: boolean;
}

export const useFileManagerColumns = ({
  setSelectedFolderId,
  setCurrentPage,
  openPreview,
  handleViewVersions,
  confirmDelete,
  setRenamingFolder,
  setNewName,
  deletingId,
  isDeleting,
}: ColumnProps) => {
  const getContextMenuItems = (record: FileItemDTO): MenuProps["items"] => {
    const isFolder = record.type === "folder";
    const isThisItemDeleting = deletingId === record.id;
    return [
      {
        key: "open",
        label: isFolder ? "Open Folder" : "Preview File",
        icon: isFolder ? <FolderOpenOutlined /> : <EyeOutlined />,
        onClick: () => {
          if (isFolder) {
            setSelectedFolderId(record.id);
          } else {
            handleFileOpen(record, (url, type) =>
              openPreview(url, type, record.name),
            );
          }
        },
      },
      {
        key: "rename",
        label: "Rename",
        icon: <EditOutlined />,
        onClick: () => {
          setRenamingFolder(record);
          setNewName(record.name);
        },
      },
      { type: "divider" },
      {
        key: "delete",
        label: isDeleting ? `Deleting...` : `Delete ${record.name}`,
        icon: isThisItemDeleting ? <Spin size="small" /> : <DeleteOutlined />,
        danger: true,
        disabled: isThisItemDeleting,
        onClick: () => confirmDelete(record),
      },
    ];
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: FileItemDTO) => {
        const isFolder = record.type === "folder";
        return (
          <span
            className={`flex items-center gap-2 cursor-pointer ${
              isFolder ? "text-slate-800" : "text-blue-600 hover:underline"
            }`}
            onClick={() => {
              if (isFolder) {
                setSelectedFolderId(record.id);
                setCurrentPage(1);
              } else {
                handleFileOpen(record, (url, type) =>
                  openPreview(url, type, record.name),
                );
              }
            }}
          >
            {isFolder ? (
              <FolderOutlined style={{ color: "#3b82f6", fontSize: "16px" }} />
            ) : (
              getFileIcon(record.name)
            )}
            {record.name}
          </span>
        );
      },
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (s: string) => s || "--",
    },
    {
      title: "Modified Date",
      dataIndex: "modifiedDate",
      key: "modified",
      render: (date?: string) =>
        date ? new Date(date).toLocaleString() : "--",
    },
    {
      title: "Author",
      dataIndex: "ownerName",
      key: "ownerName",
      render: (s: string) => s || "Owner unknown",
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: any, record: FileItemDTO) => {
        const isFile = record.type === "file";
        const isThisItemDeleting = deletingId === record.id;
        return (
          <Space size="middle">
            {isFile ? (
              <Button
                type="text"
                disabled={isThisItemDeleting}
                icon={
                  isThisItemDeleting ? (
                    <Spin size="small" />
                  ) : (
                    <HistoryOutlined />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewVersions(record);
                }}
              />
            ) : null}
          </Space>
        );
      },
    },
  ];

  return { columns, getContextMenuItems };
};

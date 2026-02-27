import {
  FolderOutlined,
  FileOutlined,
  VideoCameraOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  CodeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import React from "react";
import type TreeNode from "../types/TreeNode";
import type { FileItemDTO } from "../types/FileManagerTypes";
import { fetchFileContent } from "../api/apiCall";
import { Modal } from "antd";
export const getFolderIcon = (type?: string) => {
  switch (type) {
    case "videos":
      return (
        <VideoCameraOutlined style={{ color: "#4f46e5", fontSize: "16px" }} />
      );
    case "documents":
      return <FolderOutlined style={{ color: "#3b82f6", fontSize: "16px" }} />;
    default:
      return <FolderOutlined style={{ color: "#3b82f6", fontSize: "16px" }} />;
  }
};

export const getFileIcon = (fileName?: string) => {
  const extension = fileName?.split(".")[1];
  switch (extension) {
    case "xlsx":
      return (
        <FileExcelOutlined style={{ color: "#16a34a", fontSize: "16px" }} />
      );

    case "pdf":
      return <FilePdfOutlined style={{ color: "#dc2626", fontSize: "16px" }} />;

    case "docx":
      return (
        <FileWordOutlined style={{ color: "#2563eb", fontSize: "16px" }} />
      );

    case "csv":
      return <FileOutlined />;

    case "json":
      return <CodeOutlined style={{ color: "#d97706", fontSize: "16px" }} />;

    case "txt":
      return <FileTextOutlined style={{ fontSize: "16px" }} />;

    default:
      return <FilePdfOutlined style={{ color: "#dc2626", fontSize: "16px" }} />;
  }
};

export const updateTreeData = (
  list: TreeNode[],
  key: React.Key,
  children: TreeNode[],
): TreeNode[] => {
  return list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }
    console.log("Node children", node.children);
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }

    return node;
  });
};
export const handleBreadCrumbs = (
  selectedPath: string,
  index: number,
  setSelectedPath: (path: string) => void,
) => {
  const parts = [
    "root",
    ...selectedPath.split("/").filter((p) => p !== "root"),
  ];

  const newPath = parts.slice(0, index + 1).join("/");

  setSelectedPath(newPath === "root" ? "root" : newPath.replace("root/", ""));
};

export const getBreadCrumbsPath = (
  selectedPath: string,
  index: number,
): string => {
  const parts = [
    "root",
    ...selectedPath.split("/").filter((p) => p !== "root"),
  ];

  const newPath = parts.slice(0, index + 1).join("/");

  return newPath === "root" ? "root" : newPath.replace("root/", "");
};

export const findNodeByPath = (
  nodes: TreeNode[],
  path: string,
): TreeNode | null => {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
};

export const getParentChain = (
  tree: TreeNode[],
  targetId: string,
): string[] => {
  const map = new Map<string, TreeNode>();

  const flatten = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      map.set(node.key as string, node);
      if (node.children) flatten(node.children);
    }
  };

  flatten(tree);

  const keys: string[] = [];
  let current = map.get(targetId);

  while (current) {
    keys.unshift(current.key as string);
    if (!current.parentId) break;
    current = map.get(current.parentId);
  }

  return keys;
};
export const getFolderPopOverContent = (
  folderName: string,
  folderPath: string,
) => (
  <div className="p-1">
    <p>
      <strong>{folderPath}</strong>
      {}
    </p>
    <p className="text-xs text-gray-500">
      Click to view contents of {folderName} in {folderPath}
    </p>
  </div>
);

export const handleFileOpen = async (
  file: FileItemDTO,
  openPreview: (url: string, type: string) => void,
) => {
  const response = await fetchFileContent(file.id);

  const contentType = response.headers["content-type"];

  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);

  const canPreview =
    contentType.startsWith("image/") ||
    contentType === "application/pdf" ||
    contentType === "text/plain";

  if (canPreview) {
    openPreview(url, contentType);
  } else {
    Modal.confirm({
      title: "Download file",
      content: `Do you want to download ${file.name}?`,
      okText: "Download",
      cancelText: "Cancel",
      onOk: () => {
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
      },
    });
  }
};

//Legacy - Used for dummy data
export const buildTree = (path: string): TreeNode[] => {
  const data = fileSystem[path];
  if (!data) return [];

  return [
    {
      title: (
        <Popover
          title="Folder info"
          placement="right"
          mouseEnterDelay={0.5}
          content={getFolderPopOverContent(
            path === "root" ? "Root" : (path.split("/").pop() ?? "Folder"),
          )}
        >
          <span>{path === "root" ? "Root" : path.split("/").pop()}</span>
        </Popover>
      ),
      key: path,
      path: path,
      icon: getFolderIcon(path === "root" ? undefined : "documents"),
      children: data.folders.map(
        (folder: { name: string; folderType: string }) => {
          const childPath =
            path === "root" ? folder.name : `${path}/${folder.name}`;
          const node = buildTree(childPath)[0];
          return { ...node, icon: getFolderIcon(folder.folderType) };
        },
      ),
    },
  ];
};

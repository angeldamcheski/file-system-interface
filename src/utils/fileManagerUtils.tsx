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
import { Popover } from "antd";
import React from "react";

export const getFolderIcon = (type?: string) => {
  switch (type) {
    case "videos":
      return (
        <VideoCameraOutlined style={{ color: "#4f46e5", fontSize: "16px" }} />
      );
    case "documents":
      return <FolderOutlined style={{ color: "#3b82f6", fontSize: "16px" }} />;
    default:
      return <FolderOutlined style={{ color: "#8b5cf6", fontSize: "16px" }} />;
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
      return <FileOutlined style={{ fontSize: "16px" }} />;
  }
};

export const updateTreeData = (
  list: any[],
  key: React.Key,
  children: any[],
): any[] => {
  return list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }

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

export const findNodeByPath = (nodes: any[], path: string): any | null => {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
};

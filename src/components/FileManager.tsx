import {
  FolderOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  VideoCameraOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  CodeOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import {
  fetchFiles,
  fetchFolderContent,
  fetchFolders,
} from "../services/fileManagerService";
import { Tree, Breadcrumb, Table, Button, Space, Spin, Popover } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fileSystem } from "../services/fakeApi";

const FileManager = () => {
  const [isSidebarVisible, setIsSideBarVisible] = useState(true);
  const [selectedPath, setSelectedPath] = useState("root");
  const [isStacked, setIsStacked] = useState(false);
  const getFolderPopOverContent = (folderName: string, path: string) => (
    <div className="p-1">
      <p>
        <strong>Path: </strong>
        {path}
      </p>
      <p className="text-xs text-gray-500">
        Click to view contents of {folderName}
      </p>
    </div>
  );
  const getFolderIcon = (type?: string) => {
    switch (type) {
      case "videos":
        return (
          <VideoCameraOutlined style={{ color: "#4f46e5", fontSize: "16px" }} />
        );
      case "documents":
        return (
          <FolderOutlined style={{ color: "#3b82f6", fontSize: "16px" }} />
        );
      default:
        return (
          <FolderOutlined style={{ color: "#8b5cf6", fontSize: "16px" }} />
        );
    }
  };
  const getFileIcon = (fileName?: string) => {
    const extension = fileName?.split(".")[1];
    switch (extension) {
      case "xlsx":
        return (
          <FileExcelOutlined style={{ color: "#4ade80", fontSize: "16px" }} />
        );

      case "pdf":
        return (
          <FilePdfOutlined style={{ color: "#ef4444", fontSize: "16px" }} />
        );

      case "docx":
        return (
          <FileWordOutlined style={{ color: "#0ea5e9", fontSize: "16px" }} />
        );

      case "csv":
        return <FileOutlined />;

      case "json":
        return <CodeOutlined style={{ color: "#f59e0b", fontSize: "16px" }} />;

      case "txt":
        return <FileTextOutlined style={{ fontSize: "16px" }} />;

      default:
        return <FileOutlined style={{ fontSize: "16px" }} />;
    }
  };
  const buildTree = (path: string): any[] => {
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
              path === "root" ? "Root" : path.split("/").pop(),
              path,
            )}
          >
            <span>{path === "root" ? "Root" : path.split("/").pop()}</span>
          </Popover>
        ),
        key: path,
        icon: getFolderIcon(path === "root" ? undefined : "documents"),
        children: data.folders.map((folder: any) => {
          const childPath =
            path === "root" ? folder.name : `${path}/${folder.name}`;
          const node = buildTree(childPath)[0];

          return { ...node, icon: getFolderIcon(folder.folderType) };
        }),
      },
    ];
  };

  const { data: rootFolders = [] } = useQuery({
    queryKey: ["folders", "root"],
    queryFn: () => fetchFolders("root"),
  });
  const { data: rootFiles = [] } = useQuery({
    queryKey: ["files", "root"],
    queryFn: () => fetchFiles("root"),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["folderContent", selectedPath],
    queryFn: () => fetchFolderContent(selectedPath),
  });
  const folders =
    data?.folders.map((name: string) => ({
      name,
      path: selectedPath === "root" ? name : `${selectedPath}/${name}`,
      type: "folder",
    })) || [];

  const files =
    data?.files.map((name: string) => ({
      name,
      path: `${selectedPath}/${name}`,
      type: "file",
      size: Math.floor(Math.random() * 5000) + "kb",
      modified: new Date().toISOString(),
    })) || [];
  const tableData = [...files];
  const treeData = buildTree("root");

  const handleBreadCrumbs = (index: number) => {
    const parts = [
      "root",
      ...selectedPath.split("/").filter((p) => p !== "root"),
    ];
    const newPath = parts.slice(0, index + 1).join("/");

    setSelectedPath(newPath === "root" ? "root" : newPath.replace("root/", ""));
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <span className="flex items-center gap-2">
          {getFileIcon(text)}
          {text}
        </span>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (s: string) => s || "--",
    },
    {
      title: "Modified Date",
      dataIndex: "modified",
      key: "modified",
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-neutral-50 border border-slate-200 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">File Manager</h2>
      <div
        className={`flex transition-all duration-500 ease-in-out border border-slate-200 rounded-md overflow-hidden  ${isStacked ? "flex-col" : "flex-col md:flex-row"}`}
      >
        {/* Left Div */}

        {isSidebarVisible && (
          <div
            className={`w-full ${isStacked ? "w-full" : "w-full md:w-1/3"} border-r border-slate-200 bg-white  p-4 min-h-[500px]`}
          >
            <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 text-blue-600 rounded">
              <FolderOutlined />{" "}
              <span className="font-semibold text-black">
                Root/{selectedPath === "root" ? "" : selectedPath}
              </span>
            </div>
            <Tree
              treeData={treeData}
              selectedKeys={[selectedPath]}
              onSelect={(keys) => {
                if (keys.length) setSelectedPath(keys[0] as string);
              }}
              showIcon
              expandAction="click"
              defaultExpandAll={false}
            />
          </div>
        )}
        {/* Right Div */}
        {/* ${isStacked ? "w-full" : "w-full md:w-2/3"} ${!isSidebarVisible ? "w-full" : "w-full md:w-2/3"} */}
        <div
          className={`w-full ${!isSidebarVisible ? "w-full" : isStacked ? "w-full" : "w-full md:w-2/3"} flex flex-col`}
        >
          <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center">
            <Breadcrumb
              items={[
                "root",
                ...selectedPath.split("/").filter((p) => p !== "root"),
              ].map((part, index) => ({
                title: (
                  <span
                    className="cursor-pointer hover: text-blue-500 transition-colors"
                    onClick={() => handleBreadCrumbs(index)}
                  >
                    {part === "root" ? "Root" : part}
                  </span>
                ),
              }))}
            />
          </div>

          <div className="p-3 flex justify-end border-b border-slate-200 border-t-slate-200">
            <Space className="border border-slate-200 rounded-md px-2 py-1 bg-white">
              <Button
                icon={
                  isSidebarVisible ? (
                    <MenuFoldOutlined />
                  ) : (
                    <MenuUnfoldOutlined />
                  )
                }
                onClick={() => setIsSideBarVisible(!isSidebarVisible)}
              >
                {isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
              </Button>
              <Button type="text" icon={<PlusOutlined />}>
                Add Folder
              </Button>
              <div className="w-[1px] h-4 bg-slate-200" />
              <Button type="text" icon={<EditOutlined />} />
              <Button type="text" icon={<DeleteOutlined />} />
              <div className="w-[1px] h-4 bg-slate-200" />
              <Button
                type={`${!isStacked ? "primary" : "text"}`}
                onClick={() => setIsStacked(false)}
                icon={<ColumnWidthOutlined />}
              ></Button>
              <Button
                type={`${isStacked ? "primary" : "text"}`}
                onClick={() => setIsStacked(true)}
                icon={<ColumnHeightOutlined />}
              ></Button>
            </Space>
          </div>

          <Spin spinning={isLoading}>
            <Table
              dataSource={tableData}
              columns={columns}
              pagination={false}
              rowKey="path"
              locale={{ emptyText: "No files in this folder" }}
              className="hover:cursor-pointer text-wrap"
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default FileManager;

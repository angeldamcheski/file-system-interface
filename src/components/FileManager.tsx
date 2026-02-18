import {
  FolderOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileOutlined,
} from "@ant-design/icons";
import {
  fetchFiles,
  fetchFolderContent,
  fetchFolders,
} from "../services/fileManagerService";
import { Tree, Breadcrumb, Table, Button, Space, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fileSystem } from "../services/fakeApi";

const FileManager = () => {
  const buildTree = (path: string): any[] => {
    const data = fileSystem[path];
    if (!data) return [];

    return [
      {
        title: path === "root" ? "Root" : path.split("/").pop(),
        key: path,
        icon: <FolderOutlined />,
        children: [
          ...data.folders.map(
            (folder: string) =>
              buildTree(path === "root" ? folder : `${path}/${folder}`)[0],
          ),
          ...data.files.map((file: string) => ({
            title: file,
            key: `${path}/${file}`,
            icon: <FileOutlined />,
            isLeaf: true,
          })),
        ],
      },
    ];
  };

  const [selectedPath, setSelectedPath] = useState("root");

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
  const tableData = [...folders, ...files];
  const treeData = buildTree("root");
  console.log(folders, files);

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
          {record.type === "folder" ? (
            <FolderOutlined className="text-amber-500" />
          ) : (
            <FileOutlined className="text-blue-400" />
          )}
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
      <div className="flex border border-slate-200 rounded-md overflow-hidden">
        {/* Left Div */}
        <div className="w-1/3 border-r border-slate-200 bg-white  p-4 min-h-[500px]">
          <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 text-blue-600 rounded">
            <FolderOutlined />{" "}
            <span className="font-semibold text-black">Root</span>
          </div>
          <Tree
            treeData={treeData}
            selectedKeys={[selectedPath]}
            onSelect={(keys) => {
              if (keys.length) setSelectedPath(keys[0] as string);
            }}
            showIcon
            defaultExpandAll
          />
        </div>
        {/* Right Div */}
        <div className="w-2/3 flex flex-col">
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
              <Button type="text" icon={<PlusOutlined />}>
                Add Folder
              </Button>
              <div className="w-[1px] h-4 bg-slate-200" />
              <Button type="text" icon={<EditOutlined />} />
              <Button type="text" icon={<DeleteOutlined />} />
            </Space>
          </div>

          <Spin spinning={isLoading}>
            <Table
              dataSource={tableData}
              columns={columns}
              pagination={false}
              rowKey="path"
              onRow={(record) => ({
                onClick: () => {
                  if (record.type === "folder") setSelectedPath(record.path);
                },
              })}
              locale={{ emptyText: "No files in this folder" }}
              className="hover:cursor-pointer"
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default FileManager;

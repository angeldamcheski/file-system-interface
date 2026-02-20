import {
  FolderOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { fetchFolderContent, fetchRootFolder } from "../api/apiCall";
import { Tree, Breadcrumb, Table, Button, Space, Spin, Popover } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fileSystem } from "../services/fakeApi";
import type { FolderContentDTO } from "../types/FileManagerTypes";
import {
  getFolderIcon,
  getFileIcon,
  getBreadCrumbsPath,
  findNodeByPath,
} from "../utils/fileManagerUtils";
import type TreeNode from "../types/TreeNode";
const FileManager = () => {
  const [isSidebarVisible, setIsSideBarVisible] = useState(true);
  const [selectedPath, setSelectedPath] = useState("root");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isStacked, setIsStacked] = useState(false);
  const [rootName, setRootName] = useState("Root");
  const [treeData, setTreeData] = useState<TreeNode[]>([
    {
      title: "Root",
      key: "root",
      IdFolder: null,
      isLeaf: false,
      path: "root",
    },
  ]);
  const getFolderPopOverContent = (folderName: string) => (
    <div className="p-1">
      <p>
        <strong>Path: </strong>
        {}
      </p>
      <p className="text-xs text-gray-500">
        Click to view contents of {folderName}
      </p>
    </div>
  );
  const buildTree = (path: string): TreeNode[] => {
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
  const fetchRoot = async () => {
    const rootFolderName = await fetchRootFolder();
    console.log(rootFolderName);
  };
  useEffect(() => {
    const loadRoot = async () => {
      const root = await fetchRootFolder();

      setTreeData([
        {
          title: root.name,
          key: root.id,
          IdFolder: root.id,
          isLeaf: false,
          path: "root",
        },
      ]);
      setRootName(root.name);
      setSelectedFolderId(root.id);
    };

    loadRoot();
  }, []);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
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
      dataIndex: "modifiedDate",
      key: "modified",
      render: (date?: string) =>
        date ? new Date(date).toLocaleString() : "--",
    },
  ];
  const onBreadCrumbClick = (index: number) => {
    const newPath = getBreadCrumbsPath(selectedPath, index);
    const node = findNodeByPath(treeData, newPath);
    if (!node) return;
    setSelectedPath(newPath);
    setSelectedFolderId(node.key as string);
  };
  // DATA FROM FILENET

  const { data, isLoading } = useQuery<FolderContentDTO>({
    queryKey: ["folderContent", selectedFolderId ?? "root"],
    queryFn: () => fetchFolderContent(selectedFolderId ?? null),
    placeholderData: (previousData: FolderContentDTO) => previousData,
  });
  const ibmFiles = data?.files ?? [];
  const tableData = [...ibmFiles];

  const updateTreeData = (
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

      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }

      return node;
    });
  };
  return (
    <div className="max-w-6xl mx-auto  p-6 bg-neutral-50 border border-slate-200 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">File Manager</h2>
      <div
        className={`flex transition-all duration-500 ease-in-out border border-slate-200 rounded-md overflow-hidden  ${isStacked ? "flex-col" : "flex-col md:flex-row"}`}
      >
        {/* Left Div */}

        {isSidebarVisible && (
          <div
            className={`w-full ${isStacked ? "w-full" : "w-full md:w-1/3"} border-r border-slate-200 bg-white  p-4 min-h-125`}
          >
            <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 text-blue-600 rounded overflow-hidden">
              <FolderOutlined />{" "}
              <span className="font-semibold text-sm text-black wrap-anywhere">
                {rootName}/{selectedPath === "root" ? "" : selectedPath}
              </span>
            </div>
            <Tree
              treeData={treeData}
              loadData={async (node) => {
                if (node.children) return;
                const folderId = node.key as string;

                const response = await fetchFolderContent(folderId);
                const children = response.folders.map((folder) => ({
                  title: folder.name,
                  key: folder.id,
                  IdFolder: folder.id,
                  isLeaf: false,
                  icon: getFolderIcon(folder.type),
                  path:
                    node.path === "root"
                      ? folder.name
                      : `${node.path}/${folder.name}`,
                }));

                setTreeData((origin) =>
                  updateTreeData(origin, node.key, children),
                );
              }}
              selectedKeys={selectedFolderId ? [selectedFolderId] : []}
              onSelect={(keys, info) => {
                if (!keys.length) return;
                const selectedKey = keys[0] as string;
                setSelectedFolderId(
                  selectedKey
                );
                const nodePath = (info.node as TreeNode).path ?? "root";
                setSelectedPath(nodePath);
              }}
              showIcon
              expandAction="click"
              defaultExpandAll={false}
            />
          </div>
        )}
        {/* Right Div */}
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
                    onClick={() => onBreadCrumbClick(index)}
                  >
                    {part === "root" ? rootName : part}
                  </span>
                ),
              }))}
            />
          </div>

          <div className="p-3 flex justify-end border-b border-slate-200 border-t-slate-200">
            <Space className="border border-slate-200 rounded-md px-2 py-1 bg-white">
              <Button
                type="text"
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
              <div className="w-px h-4 bg-slate-200" />

              <Button type="text" icon={<PlusOutlined />}>
                Add Folder
              </Button>
              <div className="w-px h-4 bg-slate-200" />
              <Button type="text" icon={<EditOutlined />} />
              <Button type="text" icon={<DeleteOutlined />} />
              <div className="w-px h-4 bg-slate-200" />
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
              rowKey="id"
              locale={{ emptyText: "No files in this folder" }}
              className="hover:cursor-pointer text-wrap "
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default FileManager;

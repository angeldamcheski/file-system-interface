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
import {
  fetchFolderContent,
  fetchPaginatedFolderContent,
  fetchRootFolder,
  fetchPaginatedFolders,
} from "../api/apiCall";
import { Tree, Breadcrumb, Table, Button, Space, Spin, Input } from "antd";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import {
  getFolderIcon,
  getFileIcon,
  getBreadCrumbsPath,
  findNodeByPath,
  getParentChain,
} from "../utils/fileManagerUtils";
import type TreeNode from "../types/TreeNode";
const FileManager = () => {
  const { Search } = Input;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchterm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [isSidebarVisible, setIsSideBarVisible] = useState(true);
  const [selectedPath, setSelectedPath] = useState("root");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isStacked, setIsStacked] = useState(false);
  const [rootName, setRootName] = useState("Root");
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
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

  useEffect(() => {
    const loadRoot = async () => {
      const root = await fetchRootFolder();

      setTreeData([
        {
          title: root.name,
          key: root.id,
          parentId: null,
          IdFolder: root.id,
          isLeaf: false,
          path: "root",
        },
      ]);
      setRootName(root.name);
      setSelectedFolderId(root.id);
      setExpandedKeys([root.id]);
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
    setSearchterm("");
    setSelectedPath(newPath);
    setSelectedFolderId(node.key as string);

    const keysToExpand = getParentChain(treeData, node.key as string);
    setExpandedKeys(keysToExpand);
  };
  // DATA FROM FILENET

  const {
    data: paginatedData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["folderContent", selectedFolderId, currentPage, pageSize],
    queryFn: () =>
      fetchPaginatedFolderContent(selectedFolderId, currentPage - 1, pageSize),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData,
  });
  const tableData = paginatedData?.files ?? [];
  const totalFiles = paginatedData?.hasNextPage
    ? currentPage * pageSize + 1
    : (currentPage - 1) * pageSize + tableData.length;
  console.log("Total files", paginatedData, totalFiles);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFolderId]);
  useEffect(() => {
    const delayFn = setTimeout(() => {
      setCurrentPage(1);
    }, 1000);
    return () => clearTimeout(delayFn);
  }, [searchTerm]);
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
  const {
    data: folderPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["folders", selectedFolderId, searchTerm],
    queryFn: ({ pageParam = 0 }) =>
      fetchPaginatedFolders(selectedFolderId, pageParam, 5, searchTerm),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.continuanceToken : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30,
    enabled: !!selectedFolderId,
  });
  console.log("Paginated Folders", folderPages);
  useEffect(() => {
    const firstFolder = folderPages?.pages?.[0]?.folders?.[0];

    if (searchTerm && firstFolder) {
      const parentId = selectedFolderId;

      const newNodes: TreeNode[] = folderPages.pages[0].folders.map(
        (f: any) => ({
          title: f.name,
          key: f.id,
          IdFolder: f.id,
          isLeaf: false,
          parentId: parentId,
          icon: getFolderIcon(f.type),
          path: selectedPath === "root" ? f.name : `${selectedPath}/${f.name}`,
        }),
      );

      setTreeData((origin) => updateTreeData(origin, parentId!, newNodes));

      setSelectedFolderId(firstFolder.id);
      setSelectedPath(
        selectedPath === "root"
          ? firstFolder.name
          : `${selectedPath}/${firstFolder.name}`,
      );

      // 4. Ensure the parent is expanded so we can see the selection
      setExpandedKeys((prev) => Array.from(new Set([...prev, parentId!])));
    }
  }, [folderPages, searchTerm]);
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
            <Search
              className="pb-4"
              placeholder="Input Folder Name"
              loading={isFetchingNextPage}
              onChange={(e) => setSearchterm(e.target.value)}
            ></Search>
            <Tree
              treeData={treeData}
              expandedKeys={expandedKeys}
              blockNode
              onExpand={(keys) => setExpandedKeys(keys)}
              // loadData={async (node) => {
              //   if (node.children) return;
              //   const folderId = node.key as string;

              //   const response = await fetchFolderContent(folderId);
              //   const children = response.folders.map((folder) => ({
              //     title: folder.name,
              //     key: folder.id,
              //     IdFolder: folder.id,
              //     isLeaf: false,
              //     parentId: node.key as string,
              //     icon: getFolderIcon(folder.type),
              //     path:
              //       node.path === "root"
              //         ? folder.name
              //         : `${node.path}/${folder.name}`,
              //   }));
              //   console.log("All children", children);
              //   setTreeData((origin) =>
              //     updateTreeData(origin, node.key, children),
              //   );
              // }}
              loadData={async (node) => {
                if (node.children) return;
                if (hasNextPage) {
                  await fetchNextPage();
                }

                let nextPage = 0;
                let allChildren: TreeNode[] = [];

                while (true) {
                  const response = await fetchPaginatedFolders(
                    node.key as string,
                    nextPage,
                    10,
                    searchTerm,
                  );

                  const children = response.folders.map((folder) => ({
                    title: folder.name,
                    key: folder.id,
                    IdFolder: folder.id,
                    isLeaf: false,
                    parentId: node.key as string,
                    icon: getFolderIcon(folder.type),
                    path:
                      node.path === "root"
                        ? folder.name
                        : `${node.path}/${folder.name}`,
                  }));
                  allChildren = [...allChildren, ...children];

                  if (!response.hasNextPage) break;
                  console.log("All children", allChildren);
                  nextPage = parseInt(response.continuanceToken);
                }

                setTreeData((origin) =>
                  updateTreeData(origin, node.key, allChildren),
                );
              }}
              selectedKeys={selectedFolderId ? [selectedFolderId] : []}
              onSelect={(keys, info) => {
                if (!keys.length) return;
                const selectedKey = keys[0] as string;
                setSelectedFolderId(selectedKey);
                const nodePath = (info.node as TreeNode).path ?? "root";
                setSelectedPath(nodePath);
                const keysToExpand = getParentChain(treeData, selectedKey);
                setExpandedKeys(keysToExpand);
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
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalFiles,
                showSizeChanger: true,
                placement: ["bottomCenter"],
                onChange: (page, size) => {
                  if (size !== pageSize) {
                    setPageSize(size);
                    setCurrentPage(1);
                  } else {
                    setCurrentPage(page);
                  }
                },
                onShowSizeChange: (current, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                },
                pageSizeOptions: ["5", "10", "15", "20"],
              }}
              rowKey="id"
              loading={isFetching}
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

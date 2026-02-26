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
    data: folderPages,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["folders", selectedFolderId, searchTerm],
    queryFn: ({ pageParam = 0 }) =>
      fetchPaginatedFolders(selectedFolderId, pageParam, 5, searchTerm),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.continuanceToken : undefined,
    staleTime: searchTerm ? 0 : 1000 * 60 * 5, // 5 minutes
    cacheTime: searchTerm ? 0 : 1000 * 60 * 1,
    enabled: !!selectedFolderId,
  });
  console.log("Paginated Folders", folderPages);
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
  console.log("Paginated Data", paginatedData, totalFiles);

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [selectedFolderId]);
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
      console.log("Node from children", node.children);
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }

      return node;
    });
  };
  useEffect(() => {
    const delayFn = setTimeout(() => {
      if (selectedFolderId) {
        setTreeData((origin) => updateTreeData(origin, selectedFolderId, []));
        refetch();
      }
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(delayFn);
  }, [searchTerm]);

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

  // useEffect(() => {
  //   if (!folderPages || !selectedFolderId) return;

  //   // 1. Flatten all pages to get the full list (e.g., all 9 folders)
  //   const allFolders = folderPages.pages.flatMap((page) => page.folders || []);
  //   const firstFolder = allFolders[0];

  //   // 2. Map folders to TreeNodes
  //   const newNodes: TreeNode[] = allFolders.map((f: any) => ({
  //     title: f.name,
  //     key: f.id,
  //     IdFolder: f.id,
  //     isLeaf: false,
  //     parentId: selectedFolderId,
  //     icon: getFolderIcon(f.type),
  //     path: selectedPath === "root" ? f.name : `${selectedPath}/${f.name}`,
  //   }));

  //   // 3. Update the tree - This appends Page 2 to Page 1 in the UI
  //   setTreeData((origin) => updateTreeData(origin, selectedFolderId, newNodes));

  //   // 4. ALWAYS Expand the parent (selectedFolderId) so children are visible
  //   // This ensures that on "Load More", the list stays open.
  //   setExpandedKeys((prev) => Array.from(new Set([...prev, selectedFolderId])));

  //   // 5. Search-Specific Logic
  //   if (firstFolder) {
  //     setSelectedFolderId(firstFolder.id);
  //     setSelectedPath(
  //       selectedPath === "root"
  //         ? firstFolder.name
  //         : `${selectedPath}/${firstFolder.name}`,
  //     );

  //     // Also expand the newly selected first folder from search results
  //     setExpandedKeys((prev) => Array.from(new Set([...prev, firstFolder.id])));
  //   }
  // }, [folderPages, searchTerm, selectedFolderId]);

  // useEffect(() => {
  //   if (!folderPages?.pages?.length || !selectedFolderId) return;

  //   const allFolders = folderPages.pages.flatMap((page) => page.folders);

  //   const newNodes: TreeNode[] = allFolders.map((f: any) => ({
  //     title: f.name,
  //     key: f.id,
  //     IdFolder: f.id,
  //     isLeaf: false,
  //     parentId: selectedFolderId,
  //     icon: getFolderIcon(f.type),
  //     path: selectedPath === "root" ? f.name : `${selectedPath}/${f.name}`,
  //   }));

  //   setTreeData((origin) => updateTreeData(origin, selectedFolderId, newNodes));
  //   setExpandedKeys((prev) =>
  //     Array.from(new Set([...prev, selectedFolderId!])),
  //   );
  // }, [folderPages, selectedFolderId]);

  console.log("TREE DATA", treeData);

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
              allowClear
              onChange={(e) => setSearchterm(e.target.value)}
            ></Search>
            <Tree
              treeData={treeData}
              expandedKeys={expandedKeys}
              blockNode
              onExpand={(keys) => setExpandedKeys(keys)}
              loadData={async (node) => {
                // if (node.children) return;
                // setSelectedFolderId(node.key as string);

                if (node.children?.length) return;

                let nextPage = 0;
                const allChildren: TreeNode[] = [];

                const response = await fetchPaginatedFolders(
                  node.key as string,
                  nextPage,
                  5, // pageSize for tree
                  searchTerm,
                );

                // Map response folders to TreeNode
                const childrenNodes: TreeNode[] = response.folders.map(
                  (folder) => ({
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
                  }),
                );

                setTreeData((origin) =>
                  updateTreeData(origin, node.key, childrenNodes),
                );

                node["__nextPage"] = response.hasNextPage
                  ? parseInt(response.continuanceToken!)
                  : null;
                console.log("Node from inside loadData", node);
                // if (hasNextPage) {
                //   await fetchNextPage();
                // }

                // let nextPage = 0;
                // let allChildren: TreeNode[] = [];

                // while (true) {
                //   const response = await fetchPaginatedFolders(
                //     node.key as string,
                //     nextPage,
                //     10,
                //     searchTerm,
                //   );

                //   const children = response.folders.map((folder) => ({
                //     title: (
                //       <Popover
                //         title="Folder info"
                //         placement="right"
                //         mouseEnterDelay={0.5}
                //         content={getFolderPopOverContent(
                //           folder.name,
                //           node.path === "root"
                //             ? folder.name
                //             : `${node.path}/${folder.name}`,
                //         )}
                //       >
                //         <span>{folder.name}</span>
                //       </Popover>
                //     ),
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
                //   allChildren = [...allChildren, ...children];

                //   if (!response.hasNextPage) break;
                //   console.log("All children", allChildren);
                //   nextPage = parseInt(response.continuanceToken);
                // }

                // setTreeData((origin) =>
                //   updateTreeData(origin, node.key, allChildren),
                // );
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
            {hasNextPage && (
              <div className="mt-3 flex justify-center">
                <Button
                  loading={isFetchingNextPage}
                  onClick={() => {
                    fetchNextPage();
                    // updateTreeData(
                    //   treeData,
                    //   selectedFolderId ?? "",
                    //   folderPages,
                    // );
                  }}
                  type="dashed"
                  block
                >
                  Load More Folders
                </Button>
              </div>
            )}
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

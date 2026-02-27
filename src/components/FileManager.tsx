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
  fetchPaginatedFolders,
} from "../api/apiCall";
import {
  Breadcrumb,
  Table,
  Button,
  Space,
  Spin,
  Input,
  Typography,
  Modal,
} from "antd";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import { getFileIcon, handleFileOpen } from "../utils/fileManagerUtils";
import type TreeNode from "../types/TreeNode";
import FolderPanelManager from "./FolderPanelManager";
import { useFolderTreeContext } from "../context/FolderTreeContext";
import type { FileItemDTO } from "../types/FileManagerTypes";

const { Text } = Typography;

const FileManager = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { Search } = Input;
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchTerm, setSearchterm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [isSidebarVisible, setIsSideBarVisible] = useState(true);
  const [isStacked, setIsStacked] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [treeData, setTreeData] = useState<TreeNode[]>([
    {
      title: "Root",
      key: "root",
      IdFolder: null,
      isLeaf: false,
      path: "root",
    },
  ]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const openPreview = (url: string, type: string) => {
    setPreviewUrl(url);
    setPreviewType(type);
  };
  const { breadcrumbs, selectedFolderId, setSelectedFolderId } =
    useFolderTreeContext();

  console.log(breadcrumbs, "Breadcrumbs list");

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: FileItemDTO) => (
        <span
          className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer"
          onClick={() => handleFileOpen(record, openPreview)}
        >
          {getFileIcon(record.name)}
          {record.name}
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onBreadCrumbClick = (folderId: string) => {
    setSelectedFolderId(folderId);
  };
  // DATA FROM FILENET
  const {
    data: folderPages,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchNextPage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasNextPage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refetch,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    placeholderData: (previousData: FileItemDTO[]) => previousData,
  });
  const tableData = paginatedData?.files ?? [];
  const totalFiles = paginatedData?.hasNextPage
    ? currentPage * pageSize + 1
    : (currentPage - 1) * pageSize + tableData.length;
  console.log("Paginated Data", paginatedData, totalFiles);
  console.log("Selected folder id", selectedFolderId);

  console.log("TREE DATA", treeData);
  const formattedBreadcrumbs = useMemo(() => {
    return breadcrumbs.map((b) => `${b.title}/`);
  }, [breadcrumbs]);
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
              <FolderOutlined /> <Text ellipsis>{formattedBreadcrumbs}</Text>
            </div>

            <FolderPanelManager />
          </div>
        )}
        {/* Right Div */}
        <div
          className={`w-full ${!isSidebarVisible ? "w-full" : isStacked ? "w-full" : "w-full md:w-2/3"} flex flex-col`}
        >
          <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center">
            <Breadcrumb
              items={breadcrumbs.map((part) => ({
                title: (
                  <span
                    className="cursor-pointer hover: text-blue-500 transition-colors"
                    onClick={() => {
                      setSelectedFolderId(part.id);
                    }}
                  >
                    {part.title}
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
            <Modal
              open={!!previewUrl}
              footer={null}
              width="80%"
              onCancel={() => {
                if (previewUrl) {
                  window.URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
                setPreviewType(null);
              }}
            >
              {previewType?.startsWith("image/") && (
                <img src={previewUrl!} alt="preview" className="w-full" />
              )}

              {previewType === "application/pdf" && (
                <iframe
                  src={previewUrl!}
                  title="PDF Preview"
                  width="100%"
                  height="600px"
                  className="rounded-xl shadow-lg"
                />
              )}

              {previewType === "text/plain" && (
                <iframe
                  src={previewUrl!}
                  title="Text Preview"
                  width="100%"
                  height="600px"
                />
              )}
            </Modal>
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default FileManager;

import {
  FolderOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  fetchFolderPath,
  fetchPaginatedFolderContent,
  fetchRootFolder,
  uploadFile,
} from "../api/apiCall";
import {
  Breadcrumb,
  Table,
  Button,
  Space,
  Spin,
  Modal,
  message,
  Upload,
} from "antd";
import Search from "antd/es/input/Search";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { getFileIcon, handleFileOpen } from "../utils/fileManagerUtils";
import { useFolderTreeContext } from "../context/FolderTreeContext";
import type { FileItemDTO } from "../types/FileManagerTypes";
/**
 * Main File Manager component – combines folder tree navigation (left sidebar)
 * with paginated content view (right/main area) of the currently selected folder.
 *
 * Features:
 * - Responsive sidebar (folder tree) that can be toggled or stacked vertically
 * - Breadcrumb navigation synced with tree selection
 * - Paginated table of files + folders in current directory
 * - Click folder → navigate + update selection/breadcrumbs
 * - Click file → open preview modal (images, PDF, text)
 * - Toolbar with layout toggle, sidebar visibility, CRUD placeholders
 * - Uses React Query for content fetching with caching
 * - Integrates with FolderTreeContext for shared navigation state
 */
const FileManager = () => {
  const {
    selectedFolderId,
    setSelectedFolderId,
    folderSearchText,
    setFolderSearchText,
  } = useFolderTreeContext();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [innerSearchTerm, setInnerSearchTerm] = useState("");
  const [isSidebarVisible, setIsSideBarVisible] = useState(true);
  const [isStacked, setIsStacked] = useState(true);
  const {
    data: rootFolder,
    // isLoading: rootFolderLoading, // TODO take in consideration on loading spinner
    // error: rootFolderError,
  } = useQuery({
    queryKey: ["rootFolder"],
    queryFn: fetchRootFolder,
  });

  useEffect(() => {
    if (!rootFolder) return;
    setSelectedFolderId(rootFolder?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootFolder]);

  const { data: breadcrumbs } = useQuery({
    queryKey: ["folder-path", selectedFolderId],
    queryFn: () => fetchFolderPath(selectedFolderId),
    enabled: !!selectedFolderId,
    initialData: [],
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const openPreview = (url: string, type: string) => {
    setPreviewUrl(url);
    setPreviewType(type);
  };

  console.log(breadcrumbs, "Breadcrumbs list");

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: FileItemDTO) => {
        const isFolder = record.type === "folder";
        return (
          <span
            className={`flex items-center gap-2 cursor-pointer ${isFolder ? "text-slate-800" : "text-blue-600 hover:underline "} `}
            // onClick={() => handleFileOpen(record, openPreview)}
            onClick={() => {
              if (isFolder) {
                setSelectedFolderId(record.id);
                setCurrentPage(1);
              } else {
                handleFileOpen(record, openPreview);
              }
            }}
          >
            {isFolder ? (
              <FolderOutlined style={{ color: "#3b82f6" }} />
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
  ];

  const {
    data: paginatedData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "folderContent",
      selectedFolderId,
      currentPage,
      pageSize,
      innerSearchTerm,
    ],
    queryFn: () =>
      fetchPaginatedFolderContent(
        selectedFolderId,
        currentPage - 1,
        pageSize,
        innerSearchTerm,
      ),
    // staleTime: 1000 * 60 * 5,
    // cacheTime: 1000 * 60 * 30,
    enabled: !!selectedFolderId,
    placeholderData: (previousData: FileItemDTO[]) => previousData,
  });
  const uploadMutation = useMutation({
    mutationFn: ({ folderId, file }: { folderId: string; file: File }) =>
      uploadFile(folderId, file),
    onSuccess: () => {
      message.success("File uploaded successfully", 4);
      queryClient.invalidateQueries({
        queryKey: ["folderContent", selectedFolderId],
      });
    },
    onError: (error: any) => {
      console.log("Error object from backend", error.response);
      const serverErrorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      if (error.response?.status === 409) {
        // Modal.error({
        //   title: "Duplicate file",
        //   content: serverErrorMessage,
        // });
        message.error(serverErrorMessage, 4);
      } else {
        message.error(
          "Upload failed: " + (serverErrorMessage || error.message),
          4,
        );
      }
    },
  });
  const handleUpload = (file: File) => {
    if (!selectedFolderId) {
      message.error("Please select a folder first");
      return Upload.LIST_IGNORE;
    }
    const isAllowedType =
      file.type === "application/pdf" ||
      file.type.startsWith("image/") ||
      file.type === "text/plain";
    const lessThanSizeLimit = file.size / 1024 / 1024 < 10;

    if (!isAllowedType) {
      message.error("File type not supported. Only PDF, Images or Text Files!");
      return Upload.LIST_IGNORE;
    }
    if (!lessThanSizeLimit) {
      message.error("File size exceeding 10MB!");
      return Upload.LIST_IGNORE;
    }
    const isDuplicate = tableData.some(
      (item: FileItemDTO) =>
        item.name.toLowerCase() === file.name.toLowerCase() &&
        item.type === "file",
    );
    if (isDuplicate) {
      Modal.error({
        title: "Duplicate file name",
        content: `A file named ${file.name} already exists in this folder. Please rename the file and try again`,
      });
      return Upload.LIST_IGNORE;
    }

    uploadMutation.mutate({
      folderId: selectedFolderId,
      file,
    });
    return false;
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      setInnerSearchTerm(folderSearchText);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [folderSearchText]);
  useEffect(() => {
    setInnerSearchTerm("");
    setFolderSearchText("");
  }, [selectedFolderId]);
  const tableData = paginatedData?.items ?? [];
  console.log("Search term = ", innerSearchTerm);
  return (
    <div className="max-w-6xl mx-auto  p-6 bg-neutral-50 border border-slate-200 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">File Manager</h2>
      <div
        className={`flex transition-all duration-500 ease-in-out border border-slate-200 rounded-md overflow-hidden  ${isStacked ? "flex-col" : "flex-col md:flex-row"}`}
      >
        {/* Right Div */}
        <div
          className={`w-full ${!isSidebarVisible ? "w-full" : isStacked ? "w-full" : "w-full md:w-2/3"} flex flex-col min-h-130`}
        >
          <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center">
            <Breadcrumb
              items={breadcrumbs.map((part) => ({
                title: (
                  <span
                    className="cursor-pointer hover: text-blue-500 transition-colors"
                    onClick={() => {
                      setCurrentPage(1);
                      setSelectedFolderId(part.Id);
                    }}
                  >
                    {part.folderName}
                  </span>
                ),
              }))}
            />
          </div>

          <div className="p-3 flex justify-end border-b border-slate-200 border-t-slate-200">
            <Space className="border border-slate-200 rounded-md px-2 py-1 bg-white">
              {/* <Button
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
              </Button> */}
              {/* <div className="w-px h-4 bg-slate-200" /> */}
              <Search
                placeholder="Search"
                variant="borderless"
                allowClear
                onChange={(e) => setFolderSearchText(e.target.value)}
                value={folderSearchText}
                className="hover:inset-shadow-sm/15 rounded-md transition-all duration-300 focus-within:bg-white focus-within:inset-shadow-sm/5  "
              />
              <div className="w-px h-4 bg-slate-200" />
              <Button type="text" icon={<PlusOutlined />}>
                Add Folder
              </Button>
              <div className="w-px h-4 bg-slate-200" />
              <Upload
                beforeUpload={handleUpload}
                showUploadList={false}
                accept="*/*"
              >
                <Button
                  type="text"
                  icon={<UploadOutlined />}
                  loading={uploadMutation.isPending}
                >
                  Upload a File
                </Button>
              </Upload>
              <div className="w-px h-4 bg-slate-200" />
              <Button type="text" icon={<EditOutlined />} />
              <Button type="text" icon={<DeleteOutlined />} />
              {/* <div className="w-px h-4 bg-slate-200" /> */}
              {/* <Button
                type={`${!isStacked ? "primary" : "text"}`}
                onClick={() => setIsStacked(false)}
                icon={<ColumnWidthOutlined />}
              ></Button>
              <Button
                type={`${isStacked ? "primary" : "text"}`}
                onClick={() => setIsStacked(true)}
                icon={<ColumnHeightOutlined />}
              ></Button> */}
            </Space>
          </div>

          <Spin spinning={isLoading}>
            <Table
              dataSource={tableData}
              columns={columns}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: paginatedData?.totalItems,
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
                onShowSizeChange: (_current, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                },
                pageSizeOptions: ["5", "10", "15", "20"],
              }}
              onRow={(record) => {
                return {
                  onClick: () => {
                    if (record.type === "file") {
                      return;
                    }
                    setSelectedFolderId(record.id);
                    setCurrentPage(1);
                  },
                };
              }}
              rowKey="id"
              loading={isFetching}
              locale={{ emptyText: "No files in this folder" }}
              rowClassName={(record) =>
                record.type === "folder"
                  ? "hover:shadow-sm hover:rounded transition-all"
                  : "hover:shadow-sm hover:rounded transition-all"
              }
              className="hover:cursor-pointer text-wrap "
            />
            <Modal
              open={!!previewUrl}
              footer={null}
              centered={true}
              width="75%"
              onCancel={() => {
                if (previewUrl) {
                  window.URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
                setPreviewType(null);
              }}
              styles={{
                body: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "80vh",
                  padding: 0,
                },
              }}
            >
              {previewType?.startsWith("image/") && (
                <img
                  src={previewUrl!}
                  alt="preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: "4px",
                  }}
                />
              )}

              {previewType === "application/pdf" && (
                <iframe
                  src={previewUrl!}
                  title="PDF Preview"
                  width="100%"
                  height="600px"
                  className="rounded-md shadow-lg"
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

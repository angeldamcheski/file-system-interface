import {
  fetchFileVersions,
  fetchFolderPath,
  fetchRootFolder,
} from "../api/apiCall";
import { Breadcrumb, Table, Spin, Dropdown, Modal, Input } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { useFolderContent } from "../hooks/useFolderContent";
import { handleFileOpen, handleUpload } from "../utils/fileManagerUtils";
import { useFolderTreeContext } from "../context/FolderTreeContext";
import type { FileItemDTO } from "../types/FileManagerTypes";
import { useUploadFile } from "../hooks/useUploadFile";
import { VersionHistoryModal } from "./VersionHistoryModal";
import FilePreviewModal from "./FilePreviewModal";
import ActionSpacebar from "./ActionSpacebar";
import { useRenameItem } from "../hooks/useRenameItem";
import { useDeleteItem } from "../hooks/useDeleteItem";
import { useFileManagerColumns } from "../hooks/useFileManagerColumns";
import type {
  SearchCriterionDTO,
  SearchRequestDTO,
} from "../types/AdvancedSearchTypes";
import { useAdvancedFileSearch } from "../hooks/useAdvancedFileSearch";
import { AdvancedSearchModal } from "./AdvancedFileSearchPanel";
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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [innerSearchTerm, setInnerSearchTerm] = useState("");
  const [isSidebarVisible, setIsSideBarVisible] = useState(true);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [isAdvancedSearchModalOpen, setIsAdvancedSearchModalOpen] =
    useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriterionDTO[]>(
    [],
  );
  const [advancedSearchInput, setAdvancedSearchInput] = useState("");
  const [selectedFileForVersions, setSelectedFileForVersions] =
    useState<FileItemDTO | null>(null);
  const [isStacked, setIsStacked] = useState(true);
  const [renamingFolder, setRenamingFolder] = useState<FileItemDTO | null>(
    null,
  );
  const [newName, setNewName] = useState("");
  const { confirmDelete, deletingId } = useDeleteItem(selectedFolderId);
  const { mutate: renameItem, isPending: isRenamePending } =
    useRenameItem(selectedFolderId);
  const handleRenameSubmit = () => {
    if (renamingFolder && newName.trim() && newName !== renamingFolder.name) {
      renameItem({ item: renamingFolder, newName });
    }
    setRenamingFolder(null);
  };

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
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const openPreview = (url: string, type: string, name?: string) => {
    setPreviewUrl(url);
    setPreviewType(type);
    setPreviewFileName(name || null);
  };
  const handleViewVersions = (record: FileItemDTO) => {
    setSelectedFileForVersions(record);
    setIsVersionModalOpen(true);
  };

  const { data: versions, isLoading: versionsLoading } = useQuery({
    queryKey: ["fileVersions", selectedFileForVersions?.id],
    queryFn: () => fetchFileVersions(selectedFileForVersions!.id),
    enabled: !!selectedFileForVersions?.id,
  });
  const {
    data: paginatedData,
    isLoading,
    isFetching,
    refetch: refetchFolderContent,
  } = useFolderContent(
    selectedFolderId,
    currentPage,
    pageSize,
    innerSearchTerm,
  );
  //Advanced Search Request
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
    isFetching: isSearchFetching,
  } = useAdvancedFileSearch({
    searchCriteria,
    currentPage,
    pageSize,
    enabled: isAdvancedSearch,
  });

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
  const tableData = isAdvancedSearch
    ? (searchResults?.files ?? [])
    : (paginatedData?.items ?? []);
  const uploadMutation = useUploadFile(selectedFolderId!, tableData);
  const uploadHandler = useCallback(
    (file: File) => {
      return handleUpload(file, selectedFolderId!, uploadMutation);
    },
    [selectedFolderId, uploadMutation],
  );
  const { columns, getContextMenuItems } = useFileManagerColumns({
    setSelectedFolderId,
    setCurrentPage,
    openPreview,
    handleViewVersions,
    confirmDelete,
    setRenamingFolder,
    setNewName,
    deletingId,
  });
  const openAdvancedSearch = () => setIsAdvancedSearchModalOpen(true);
  const closeAdvancedSearch = () => setIsAdvancedSearchModalOpen(false);
  const handleAdvancedSearchSubmit = (request: SearchRequestDTO) => {
    setSearchCriteria(request.criteria);
    setIsAdvancedSearch(true);
    setCurrentPage(1);
    // setIsAdvancedSearchModalOpen(false);
  };
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
                      setIsAdvancedSearch(false);
                    }}
                  >
                    {part.folderName}
                  </span>
                ),
              }))}
            />
          </div>
          {isAdvancedSearchModalOpen && (
            <AdvancedSearchModal
              visible={isAdvancedSearchModalOpen}
              onClose={() => {
                setIsAdvancedSearchModalOpen(false);
                setIsAdvancedSearch(false);
              }}
              onSearch={handleAdvancedSearchSubmit}
            />
          )}
          <div className="p-3 flex justify-end border-b border-slate-200 border-t-slate-200">
            <ActionSpacebar
              setFolderSearchText={setFolderSearchText}
              folderSearchText={folderSearchText}
              handleUpload={uploadHandler}
              isPending={uploadMutation.isPending}
              selectedFolderId={selectedFolderId}
              onFolderCreated={() => {
                refetchFolderContent();
              }}
              openAdvancedSearch={openAdvancedSearch}
            ></ActionSpacebar>
          </div>
          {/* VERSION HISTORY MODAL */}
          <VersionHistoryModal
            open={isVersionModalOpen}
            onClose={() => {
              setIsVersionModalOpen(false);
              setSelectedFileForVersions(null);
            }}
            versions={versions || []}
            loading={versionsLoading}
            openPreview={openPreview}
            fileName={selectedFileForVersions?.name}
          />

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
              components={{
                body: {
                  row: (props: any) => {
                    const rowId = props["data-row-key"];
                    const isDeleting = deletingId === rowId;
                    const record = tableData.find((i) => i.id === rowId);

                    // Define row structure with loading overlay
                    const rowContent = (
                      <tr
                        {...props}
                        className={`${props.className} ${isDeleting ? "opacity-50 pointer-events-none relative" : ""}`}
                      >
                        {isDeleting && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/20 z-10">
                            <Spin size="small" description="Deleting..." />
                          </div>
                        )}
                        {props.children}
                      </tr>
                    );

                    if (record) {
                      return (
                        <Dropdown
                          menu={{ items: getContextMenuItems(record) }}
                          trigger={["contextMenu"]}
                          disabled={isDeleting}
                        >
                          {rowContent}
                        </Dropdown>
                      );
                    }
                    return rowContent;
                  },
                },
              }}
              onRow={(record) => {
                return {
                  onClick: (event) => {
                    if (
                      (event.target as HTMLElement).closest(
                        ".ant-dropdown-trigger",
                      )
                    ) {
                      return;
                    }
                    if (record.type === "folder") {
                      setSelectedFolderId(record.id);
                      setCurrentPage(1);
                    } else {
                      handleFileOpen(record, (url, type) =>
                        openPreview(url, type, record.name),
                      );
                    }
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
              title={`Rename ${renamingFolder?.type === "folder" ? "Folder" : "File"}`}
              open={!!renamingFolder}
              onOk={handleRenameSubmit}
              confirmLoading={isRenamePending}
              onCancel={() => setRenamingFolder(null)}
              destroyOnHidden
            >
              <Input
                autoFocus
                placeholder="Enter new name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onPressEnter={handleRenameSubmit}
              />
            </Modal>

            <FilePreviewModal
              previewUrl={previewUrl}
              previewType={previewType}
              fileName={previewFileName}
              onClose={() => {
                if (previewUrl) {
                  window.URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
                setPreviewType(null);
              }}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};
export default FileManager;

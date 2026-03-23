import React, { useState } from "react";
import { Table, Spin, Card, Divider, Dropdown, Modal, Input } from "antd";
import dayjs from "dayjs";
import { AdvancedSearchModal } from "../components/AdvancedFileSearchPanel"; // Reusing your form component
import { useAdvancedFileSearch } from "../hooks/useAdvancedFileSearch";
import { useFileManagerColumns } from "../hooks/useFileManagerColumns";
import FilePreviewModal from "../components/FilePreviewModal";
import type {
  SearchCriterionDTO,
  SearchRequestDTO,
} from "../types/AdvancedSearchTypes";
import { useDeleteItem } from "../hooks/useDeleteItem";
import type { FileItemDTO } from "../types/FileManagerTypes";
import { useQuery } from "@tanstack/react-query";
import { fetchFileVersions } from "../api/apiCall";
import { VersionHistoryModal } from "../components/VersionHistoryModal";
import { useRenameItem } from "../hooks/useRenameItem";
import { handleFileOpen } from "../utils/fileManagerUtils";

const AdvancedSearchPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [renamingFile, setRenamingFile] = useState<FileItemDTO | null>(null);
  const [newName, setNewName] = useState("");
  // Default criteria: Last 10 days
  const [searchCriteria, setSearchCriteria] = useState<SearchCriterionDTO[]>([
    {
      property: "DateLastModified", // Ensure this matches your FileNet property name
      operator: "GREATEROREQUAL",
      values: [dayjs().subtract(10, "days").format("YYYY-MM-DDTHH:mm:ss")],
      dataType: "DATE",
    },
  ]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [selectedFileForVersions, setSelectedFileForVersions] =
    useState<FileItemDTO | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const { data: versions, isLoading: isVersionsLoading } = useQuery({
    queryKey: ["fileVersions", selectedFileForVersions?.id],
    queryFn: () => fetchFileVersions(selectedFileForVersions!.id),
    enabled: !!selectedFileForVersions?.id,
  });
  // Hook to fetch search results
  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = useAdvancedFileSearch({
    searchCriteria,
    currentPage,
    pageSize,
    enabled: true, // Always enabled for the dedicated page
  });

  const handleSearchSubmit = (request: SearchRequestDTO) => {
    setSearchCriteria(request.criteria);
    setCurrentPage(1);
  };
  const handleViewVersions = (record: FileItemDTO) => {
    setSelectedFileForVersions(record);
    setIsVersionModalOpen(true);
  };
  const { confirmDelete, deletingId } = useDeleteItem(null);
  const { mutate: renameItem, isPending: isRenamePending } =
    useRenameItem(null);
  const { columns, getContextMenuItems } = useFileManagerColumns({
    setSelectedFolderId: () => {},
    setCurrentPage,
    openPreview: (url, type, name) => {
      setPreviewUrl(url);
      setPreviewType(type);
      setPreviewFileName(name || null);
    },
    handleViewVersions,
    confirmDelete,
    setRenamingFolder: setRenamingFile,
    setNewName,
    deletingId,
  });
  const handleRenameSubmit = () => {
    if (!renamingFile || !newName.trim()) return;

    renameItem({ item: renamingFile, newName });
    setRenamingFile(null);
    setNewName("");
  };

  const openPreview = (url: string, type: string, name?: string) => {
    setPreviewUrl(url);
    setPreviewType(type);
    setPreviewFileName(name || null);
  };
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card title="Advanced Document Discovery" className="shadow-md! mb-6!">
        <AdvancedSearchModal
          visible={true}
          onClose={() => {}}
          onSearch={handleSearchSubmit}
        />
      </Card>

      <Divider>Search Results</Divider>

      <Card className="shadow-md!">
        <Table
          dataSource={searchResults?.files || []}
          columns={columns}
          loading={isLoading || isFetching}
          rowKey="id"
          className="hover:cursor-pointer text-wrap"
          pagination={false}
          // pagination={{
          //   current: currentPage,
          //   pageSize: pageSize,
          //   // total: searchResults,
          //   // onChange: (page, size) => {
          //   //   setCurrentPage(page);
          //   //   setPageSize(size);
          //   // },
          // }}
          components={{
            body: {
              row: (props: any) => {
                const rowId = props["data-row-key"];
                const isDeleting = deletingId === rowId;
                const record = (searchResults?.files || []).find(
                  (i) => i.id === rowId,
                );

                const rowContent = (
                  <tr
                    {...props}
                    className={`${props.className} ${
                      isDeleting
                        ? "opacity-50 pointer-events-none relative"
                        : ""
                    }`}
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
              onDoubleClick: (event) => {
                // Prevent action when clicking on context menu trigger / dropdown areas
                if (
                  (event.target as HTMLElement).closest(".ant-dropdown-menu")
                ) {
                  return;
                }

                if (record.type === "folder") {
                  // Optional: if folders can appear in search results
                  // You could navigate or open folder — but usually not needed in search
                  console.log("Clicked folder in search:", record.id);
                  // Example: setSelectedFolderId(record.id); navigate somewhere...
                } else {
                  // Files → open preview
                  handleFileOpen(record, (url, type) =>
                    openPreview(url, type, record.name),
                  );
                }
              },
            };
          }}
        />
      </Card>
      <Modal
        title={`Rename ${renamingFile?.type === "folder" ? "Folder" : "File"}`}
        open={!!renamingFile}
        onOk={handleRenameSubmit}
        confirmLoading={isRenamePending}
        onCancel={() => setRenamingFile(null)}
        destroyOnHidden
      >
        <Input
          autoFocus
          onFocus={(e) => e.target.select}
          placeholder="Enter new name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleRenameSubmit}
          // onPressEnter={handleRenameSubmit}
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
      <VersionHistoryModal
        open={isVersionModalOpen}
        onClose={() => {
          setIsVersionModalOpen(false);
          setSelectedFileForVersions(null);
        }}
        versions={versions || []}
        loading={isVersionsLoading}
        openPreview={(url, type) => {
          setPreviewUrl(url);
          setPreviewType(type);
          setPreviewFileName(selectedFileForVersions?.name || null);
        }}
        fileName={selectedFileForVersions?.name}
      />
    </div>
  );
};

export default AdvancedSearchPage;

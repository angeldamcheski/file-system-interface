import React, { useState, useEffect } from "react";
import { Table, Spin, Card, Divider } from "antd";
import dayjs from "dayjs";
import { AdvancedSearchModal } from "../components/AdvancedFileSearchPanel"; // Reusing your form component
import { useAdvancedFileSearch } from "../hooks/useAdvancedFileSearch";
import { useFileManagerColumns } from "../hooks/useFileManagerColumns";
import FilePreviewModal from "../components/FilePreviewModal";
import type {
  SearchCriterionDTO,
  SearchRequestDTO,
} from "../types/AdvancedSearchTypes";

const AdvancedSearchPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

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

  const { columns } = useFileManagerColumns({
    setSelectedFolderId: () => {},
    setCurrentPage,
    openPreview: (url, type, name) => {
      setPreviewUrl(url);
      setPreviewType(type);
      setPreviewFileName(name || null);
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card title="Advanced Document Discovery" className="shadow-md mb-6">
        <AdvancedSearchModal
          visible={true}
          onClose={() => {}}
          onSearch={handleSearchSubmit}
        />
      </Card>

      <Divider>Search Results</Divider>

      <Card className="shadow-md">
        <Table
          dataSource={searchResults?.files || []}
          columns={columns}
          loading={isLoading || isFetching}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            // total: searchResults,
            // onChange: (page, size) => {
            //   setCurrentPage(page);
            //   setPageSize(size);
            // },
          }}
        />
      </Card>

      <FilePreviewModal
        previewUrl={previewUrl}
        previewType={previewType}
        fileName={previewFileName}
        onClose={() => setPreviewUrl(null)}
      />
    </div>
  );
};

export default AdvancedSearchPage;

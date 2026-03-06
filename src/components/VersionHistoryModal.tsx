import { Table, Modal, Button, Tooltip } from "antd";
import { handleFileOpen } from "../utils/fileManagerUtils";
/**
 * VersionHistoryModal Component
 * * Displays a table of previous file versions, showing modification dates,
 * file sizes, and authors. Allows users to preview historical versions.
 * * @component
 * @param {Object} props
 * @param {boolean} open - Controls the visibility of the modal.
 * @param {Function} onClose - Callback triggered when the modal is dismissed.
 * @param {Array<Object>} versions - Array of version objects (FileItemDTO).
 * @param {boolean} loading - Indicates if version data is currently being fetched.
 * @param {Function} openPreview - Callback to trigger the FilePreviewModal for a specific version.
 * @returns {React.ReactElement}
 */
export const VersionHistoryModal = ({
  open,
  onClose,
  versions,
  loading,
  openPreview,
  fileName,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <p className="font-light">
          Version history for{" "}
          <span className="font-medium ">
            {fileName ?? "File name unavailable"}
          </span>
        </p>
      }
      footer={null}
      styles={{
        body: {
          overflowY: "auto",
          maxHeight: "70vh",
          padding: "16px 0",
        },
      }}
      width={700}
    >
      <Table
        dataSource={versions}
        loading={loading}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: "Version / Author",
            dataIndex: "ownerName",
            key: "ownerName",
            render: (text) => (
              <span className="font-medium text-blue-600 italic">{text}</span>
            ),
          },
          {
            title: "Size",
            dataIndex: "size",
            key: "size",
          },
          {
            title: "Date Modified",
            dataIndex: "modifiedDate",
            key: "modifiedDate",
            render: (date: string) => new Date(date).toLocaleString(),
          },
          {
            title: "Action",
            key: "download",
            width: 80,
            render: (_, record) => (
              <Tooltip title="View version history" placement="top">
                <Button
                  type="link"
                  onClick={() => handleFileOpen(record, openPreview)}
                >
                  Preview
                </Button>
              </Tooltip>
            ),
          },
        ]}
      />
    </Modal>
  );
};

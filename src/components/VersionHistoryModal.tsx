import { Table, Modal, Button } from "antd";
import { handleFileOpen } from "../utils/fileManagerUtils";

export const VersionHistoryModal = ({
  open,
  onClose,
  versions,
  loading,
  openPreview,
}) => {
  return (
    <Modal open={open} onCancel={onClose} footer={null} style={{zIndex: "-1"}}>
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
              <Button
                type="link"
                onClick={() => handleFileOpen(record, openPreview)}
              >
                Preview
              </Button>
            ),
          },
        ]}
      />
    </Modal>
  );
};

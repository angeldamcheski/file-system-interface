import Search from "antd/es/input/Search";
import Space from "antd/es/space";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import Button from "antd/es/button";
import FileUploadButton from "./FileUploadButton";
import { useState } from "react";
import { Form, Input, message, Modal } from "antd";
import { createFolder } from "../api/apiCall";
/**
 * ActionSpacebar Component
 * * A horizontal toolbar containing search functionality and file/folder action buttons.
 * Acts as the primary control row for the File Manager.
 * * @component
 * @param {Object} props
 * @param {Function} setFolderSearchText - State setter to update the global search filter.
 * @param {string} folderSearchText - The current controlled value of the search input.
 * @param {Function} handleUpload - The validation logic passed to the FileUploadButton.
 * @param {boolean} isPending - Indicates if a file upload mutation is currently in progress.
 * @returns {React.ReactElement}
 */
const ActionSpacebar = ({
  setFolderSearchText,
  folderSearchText,
  handleUpload,
  isPending,
  selectedFolderId,
  onFolderCreated,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const handleCreateFolder = async () => {
    try {
      const newFolder = await createFolder(selectedFolderId, folderName);
      message.success(`Folder ${folderName} is successfully created`);
      setIsModalOpen(false);
      setFolderName("");
      if (onFolderCreated) {
        onFolderCreated(newFolder);
      }
    } catch (err: any) {
      message.error("Failed to create a folder: " + err.message);
    }
  };
  return (
    <>
      <Space className="border border-slate-200 rounded-md px-2 py-1 bg-white">
        <Search
          placeholder="Search"
          variant="borderless"
          allowClear
          onChange={(e) => setFolderSearchText(e.target.value)}
          value={folderSearchText}
          className="hover:inset-shadow-sm/15 rounded-md transition-all duration-300 focus-within:bg-white focus-within:inset-shadow-sm/5  "
        />
        <div className="w-px h-4 bg-slate-200" />
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Folder
        </Button>
        <div className="w-px h-4 bg-slate-200" />
        <FileUploadButton handleUpload={handleUpload} isPending={isPending} />
      </Space>
      <Modal
        title="Create New Folder"
        open={isModalOpen}
        onOk={handleCreateFolder}
        onCancel={() => setIsModalOpen(false)}
        okText="Create"
      >
        <Form>
          <Form.Item label="Folder Name" required>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              onPressEnter={handleCreateFolder}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ActionSpacebar;

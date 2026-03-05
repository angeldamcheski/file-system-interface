import Search from "antd/es/input/Search";
import Space from "antd/es/space";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import Button from "antd/es/button";
import FileUploadButton from "./FileUploadButton";

const ActionSpacebar = ({
  setFolderSearchText,
  folderSearchText,
  handleUpload,
  isPending,
}) => {
  return (
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
      <Button type="text" icon={<PlusOutlined />}>
        Add Folder
      </Button>
      <div className="w-px h-4 bg-slate-200" />
      <FileUploadButton handleUpload={handleUpload} isPending={isPending} />

      <div className="w-px h-4 bg-slate-200" />
      <Button type="text" icon={<EditOutlined />} />
      <Button type="text" icon={<DeleteOutlined />} />
    </Space>
  );
};

export default ActionSpacebar;

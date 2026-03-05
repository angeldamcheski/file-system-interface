import { Button } from "antd";
import Upload from "antd/es/upload/Upload";
import UploadOutlined from "@ant-design/icons/UploadOutlined";

const FileUploadButton = ({ handleUpload, isPending }) => {
  return (
    <Upload beforeUpload={handleUpload} showUploadList={false} accept="*/*">
      <Button type="text" icon={<UploadOutlined />} loading={isPending}>
        Upload a File
      </Button>
    </Upload>
  );
};

export default FileUploadButton;

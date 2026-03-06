import { Button } from "antd";
import Upload from "antd/es/upload/Upload";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
/**
 * FileUploadButton Component
 * * An Ant Design-based upload trigger. Intercepts the default upload behavior
 * to allow for custom validation and manual mutation handling.
 * * @component
 * @param {Object} props
 * @param {Function} handleUpload - Callback function (beforeUpload) that receives the File object.
 * @param {boolean} isPending - Loading state used to disable the button and show a spinner.
 * @returns {React.ReactElement}
 */
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

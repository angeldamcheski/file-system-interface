import { Modal } from "antd";
/**
 * FilePreviewModal Component
 * * A high-level modal wrapper used to preview different file types (Images, PDFs, Plain Text).
 * * @component
 * @param {Object} props
 * @param {string|null} previewUrl - The blob URL or endpoint URL of the file to preview.
 * @param {string|null} previewType - The MIME type of the file (e.g., 'application/pdf', 'image/png').
 * @param {Function} onClose - Callback function to close the modal and cleanup resources (e.g., revokeObjectURL).
 * @returns {React.ReactElement}
 */
const FilePreviewModal = ({ previewUrl, previewType, onClose, fileName }) => {
  return (
    <Modal
      open={!!previewUrl}
      footer={null}
      title={`${fileName}`}
      centered={true}
      width="75%"
      onCancel={onClose}
      styles={{
        body: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          padding: 0,
        },
      }}
      zIndex={2000}
    >
      {previewType?.startsWith("image/") && (
        <img
          src={previewUrl}
          alt={previewUrl}
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
          src={previewUrl}
          title="PDF Preview"
          width="100%"
          height="600px"
          className="rounded-md shadow-lg"
        />
      )}
      {previewType === "text/plain" && (
        <iframe
          src={previewUrl}
          title="Text Preview"
          width="100%"
          height="600px"
          style={{ colorScheme: "light" }}
          className="border-2 rounded-sm border-slate-200"
        />
      )}
    </Modal>
  );
};

export default FilePreviewModal;

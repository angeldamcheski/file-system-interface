import { Modal } from "antd";

const FilePreviewModal = ({ previewUrl, previewType, onClose }) => {
  return (
    <Modal
      open={!!previewUrl}
      footer={null}
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
        />
      )}
    </Modal>
  );
};

export default FilePreviewModal;

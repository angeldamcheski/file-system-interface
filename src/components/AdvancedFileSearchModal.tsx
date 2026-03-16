import React from "react";
import { Modal, Form, Select, Input, Button, Space, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  AVAILABLE_OPERATORS, // Using the new constant
} from "../types/AdvancedSearchTypes";
import type { SearchRequestDTO } from "../types/AdvancedSearchTypes";
interface AdvancedSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (request: SearchRequestDTO) => void;
}

// Predefined configuration for FileNet classes
const SEARCHABLE_CLASSES = [
  { label: "Document", value: "Document" },
  { label: "Annex Document", value: "AnexDocument" },
  { label: "Archive", value: "ArchiveDocument" },
];

// Predefined configuration for FileNet properties
const PROPERTY_OPTIONS = [
  { label: "Document Title", value: "DocumentTitle" },
  { label: "Annex Number", value: "AnexNumber" },
  { label: "Creator", value: "Creator" },
  { label: "Date Created", value: "DateCreated" },
];

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  visible,
  onClose,
  onSearch,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    const request: SearchRequestDTO = {
      baseClassName: values.baseClassName,
      searchSubclasses: true,
      andSearch: values.andSearch === "AND",
      criteria: values.criteria.map((c: any) => ({
        property: c.property,
        operator: c.operator,
        values: [c.value],
      })),
    };
    onSearch(request);
    form.resetFields(); // Optional: reset after search
  };

  return (
    <Modal
      title="Advanced File Search"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={800}
      okText="Search"
      destroyOnClose // Ensures state is clean when reopened
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          baseClassName: "Document",
          andSearch: "AND",
          criteria: [{ property: "DocumentTitle", operator: "STARTSWITH" }],
        }}
      >
        <Space size="large">
          <Form.Item
            name="baseClassName"
            label="Search In Class"
            style={{ width: 220 }}
          >
            <Select options={SEARCHABLE_CLASSES} />
          </Form.Item>

          <Form.Item
            name="andSearch"
            label="Match Logic"
            style={{ width: 180 }}
          >
            <Select
              options={[
                { label: "All Criteria (AND)", value: "AND" },
                { label: "Any Criteria (OR)", value: "OR" },
              ]}
            />
          </Form.Item>
        </Space>

        <Divider orientation="left">Search Criteria</Divider>

        <Form.List name="criteria">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  {/* Property Selection */}
                  <Form.Item
                    {...restField}
                    name={[name, "property"]}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Select
                      placeholder="Field"
                      options={PROPERTY_OPTIONS}
                      style={{ width: 180 }}
                    />
                  </Form.Item>

                  {/* Operator Selection - Now using AVAILABLE_OPERATORS constant */}
                  <Form.Item
                    {...restField}
                    name={[name, "operator"]}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Select
                      placeholder="Operator"
                      options={AVAILABLE_OPERATORS}
                      style={{ width: 160 }}
                    />
                  </Form.Item>

                  {/* Value Input */}
                  <Form.Item
                    {...restField}
                    name={[name, "value"]}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Value" style={{ width: 200 }} />
                  </Form.Item>

                  {/* Remove Button */}
                  {fields.length > 1 && (
                    <Button
                      type="text"
                      onClick={() => remove(name)}
                      icon={<DeleteOutlined />}
                      danger
                    />
                  )}
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 10 }}
                >
                  Add Search Criterion
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

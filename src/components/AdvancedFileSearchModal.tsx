// import React, { useEffect } from "react";
import { Modal, Form, Select, Input, Button, Space, Divider, Spin } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetchFileNetClasses, fetchClassProperties } from "../api/apiCall";
import { AVAILABLE_OPERATORS } from "../types/AdvancedSearchTypes";
import type {
  SearchRequestDTO,
  SearchCriterionDTO,
} from "../types/AdvancedSearchTypes";

interface AdvancedSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (request: SearchRequestDTO) => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  visible,
  onClose,
  onSearch,
}) => {
  const [form] = Form.useForm();

  // Watch the selected class to trigger property fetching
  const selectedClass = Form.useWatch("baseClassName", form);

  // 1. Fetch available classes
  const { data: classOptions, isLoading: classesLoading } = useQuery({
    queryKey: ["fileNetClasses"],
    queryFn: fetchFileNetClasses,
    enabled: visible,
  });

  // 2. Fetch properties for the currently selected class
  const { data: propertyOptions, isLoading: propsLoading } = useQuery({
    queryKey: ["classProperties", selectedClass],
    queryFn: () => fetchClassProperties(selectedClass!),
    enabled: visible && !!selectedClass,
  });
  console.log("Property options", propertyOptions);
  const handleFinish = (values: any) => {
    const request: SearchRequestDTO = {
      baseClassName: values.baseClassName,
      searchSubclasses: true,
      andSearch: values.andSearch === "AND",
      criteria: values.criteria.map(
        (c: any): SearchCriterionDTO => ({
          property: c.property,
          operator: c.operator,
          values: [c.value],
          dataType: c.dataType, // Pass the dataType to the backend
        }),
      ),
    };
    onSearch(request);
  };

  return (
    <Modal
      title="Advanced File Search"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={850}
      okText="Search"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          baseClassName: "Document",
          andSearch: "AND",
          criteria: [{ property: "DocumentTitle", operator: "LIKE" }],
        }}
      >
        <Space size="large">
          <Form.Item
            name="baseClassName"
            label="Search In Class"
            style={{ width: 250 }}
          >
            <Select
              options={classOptions}
              loading={classesLoading}
              placeholder="Select Class"
            />
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

        <Divider orientation="horizontal">Search Criteria</Divider>

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
                      loading={propsLoading}
                      options={propertyOptions}
                      style={{ width: 220 }}
                      onChange={(val) => {
                        // Find the selected property metadata to get the dataType
                        const propMeta = propertyOptions?.find(
                          (p) => p.value === val,
                        );
                        if (propMeta) {
                          form.setFieldValue(
                            ["criteria", name, "dataType"],
                            propMeta.dataType,
                          );
                        }
                      }}
                    />
                  </Form.Item>

                  {/* Hidden field for dataType metadata */}
                  <Form.Item {...restField} name={[name, "dataType"]} hidden>
                    <Input />
                  </Form.Item>

                  {/* Operator Selection */}
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

              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Search Criterion
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

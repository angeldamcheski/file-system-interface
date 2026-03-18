// import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  Space,
  Divider,
  Spin,
  Card,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CloseOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetchFileNetClasses, fetchClassProperties } from "../api/apiCall";
import { AVAILABLE_OPERATORS } from "../types/AdvancedSearchTypes";
import type {
  SearchRequestDTO,
  SearchCriterionDTO,
} from "../types/AdvancedSearchTypes";
import dayjs from "dayjs";

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
      criteria: values.criteria.map((c: any): SearchCriterionDTO => {
        let formattedValue = c.value;
        if (dayjs.isDayjs(c.value)) {
          formattedValue = c.value.format("YYYY-MM-DDTHH:mm:ss");
        }
        return {
          property: c.property,
          operator: c.operator,
          values: [formattedValue],
          dataType: c.dataType, // Pass the dataType to the backend
        };
      }),
    };
    onSearch(request);
  };

  return (
    <Card
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      width={850}
      okText="Search"
      // bordered={false}
      variant="borderless"
      destroyOnClose
      style={{
        marginTop: 20,
        borderRadius: 5,
        borderLeft: 0,
        borderRight: 0,
        borderTop: 2,
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          baseClassName: "Document",
          andSearch: "AND",
          criteria: [
            {
              property: "DateLastModified",
              operator: "GREATEROREQUAL",
              value: dayjs().subtract(10, "days"),
              dataType: "DATE",
            },
          ],
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
              showSearch
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
                      showSearch
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
                      showSearch
                    />
                  </Form.Item>

                  {/* Value Input */}
                  {/* <Form.Item
                    {...restField}
                    name={[name, "value"]}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Value" style={{ width: 200 }} />
                  </Form.Item> */}
                  <Form.Item
                    noStyle
                    // Only re-render this field if the property (and thus dataType) changes
                    shouldUpdate={(prev, curr) =>
                      prev.criteria?.[name]?.property !==
                      curr.criteria?.[name]?.property
                    }
                  >
                    {({ getFieldValue }) => {
                      // Get the dataType we stored in the hidden field during onChange
                      const dataType = getFieldValue([
                        "criteria",
                        name,
                        "dataType",
                      ]);
                      const isDate =
                        dataType === "DATE" || dataType === "DATETIMEOBJECT";

                      return (
                        <Form.Item
                          {...restField}
                          name={[name, "value"]}
                          rules={[{ required: true, message: "Required" }]}
                        >
                          {isDate ? (
                            <DatePicker
                              showTime
                              style={{ width: 200 }}
                              placeholder="Select Date"
                              needConfirm={false}
                            />
                          ) : (
                            <Input placeholder="Value" style={{ width: 200 }} />
                          )}
                        </Form.Item>
                      );
                    }}
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
        <Divider style={{ margin: "12px 0" }} />

        {/* --- SUBMIT ACTIONS --- */}
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          <Button icon={<ReloadOutlined />} onClick={() => form.resetFields()}>
            Reset
          </Button>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => form.submit()} // Manual trigger
          >
            Run Advanced Search
          </Button>
        </div>
      </Form>
    </Card>
  );
};

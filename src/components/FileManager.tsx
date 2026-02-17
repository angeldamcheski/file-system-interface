import {
  FolderOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Tree, Breadcrumb, Table, Button, Space, Spin } from "antd";
const selectedPath = "";
const isLoadingFiles = false;
const files: any = [];
const columns: any = 0;
const FileManager = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-neutral-50 border border-slate-200 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">File Manager</h2>
      <div className="flex border border-slate-200 rounded-md overflow-hidden">
        {/* Left Div */}
        <div className="w-1/3 border-r border-slate-200 bg-white  p-4 min-h-[500px]">
          <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 text-blue-600 rounded">
            <FolderOutlined />{" "}
            <span className="font-semibold text-black">Root</span>
          </div>
          <Tree showIcon defaultExpandAll />
        </div>
        <div className="w-2/3 flex flex-col">
          <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
            <Breadcrumb
              items={selectedPath.split("/").map((p) => ({ title: p }))}
            />
          </div>

          <div className="p-3 flex justify-end border-b">
            <Space className="border rounded-md px-2 py-1 bg-white">
              <Button type="text" icon={<PlusOutlined />}>
                Add Folder
              </Button>
              <div className="w-[1px] h-4 bg-slate-200" />
              <Button type="text" icon={<EditOutlined />} />
              <Button type="text" icon={<DeleteOutlined />} />
            </Space>
          </div>

          <Spin spinning={isLoadingFiles}>
            <Table
              dataSource={files}
              columns={columns}
              pagination={false}
              rowKey="path"
              locale={{ emptyText: "No files in this folder" }}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default FileManager;

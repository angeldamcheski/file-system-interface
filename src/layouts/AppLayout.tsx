import { Layout, Menu } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import FileManager2 from "../components/FileManager2";
import AdvancedSearchPage from "../pages/AdvancedSearchPage";
import { FolderOutlined, FileSearchOutlined } from "@ant-design/icons";
const AppLayout = () => {
  const location = useLocation();
  const selectedKey = location.pathname === "/search" ? "2" : "1";

  return (
    <Layout className="min-h-screen">
      <Header
        className="flex! items-center! bg-white! border-b! border-slate-200! px-6"
        style={{ backgroundColor: "white" }}
      >
        <div className="text-xl font-bold mr-8 text-blue-600">Filenet</div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          selectedKeys={[selectedKey]}
          className="flex-1! border-none!"
        >
          <Menu.Item key="1" icon={<FolderOutlined className="text-[18px]!" />}>
            <Link to="/">File Manager</Link>
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<FileSearchOutlined className="text-[18px]!" />}
          >
            <Link to="/search">Advanced Search</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content className="bg-slate-50!">
        <Routes>
          <Route path="/" element={<FileManager2 />} />
          <Route path="/search" element={<AdvancedSearchPage />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default AppLayout;

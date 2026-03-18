import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FileManager2 from "./components/FileManager2";
import { FolderTreeProvider } from "./context/FolderTreeContext";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { Layout, Menu } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import AdvancedSearchPage from "./pages/AdvancedSearchPage";
import { FolderOutlined, SearchOutlined } from "@ant-design/icons";
// TODO query client config to not refetch on window focus, etc. to avoid unnecessary refetches while testing and developing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FolderTreeProvider>
        {/* <FileManager2 /> */}
        <BrowserRouter>
          <Layout className="min-h-screen">
            <Header
              className="flex items-center bg-white border-b border-slate-200 px-6"
              style={{ backgroundColor: "white" }}
            >
              <div className="text-xl font-bold mr-8 text-blue-600">
                Filenet
              </div>
              <Menu
                mode="horizontal"
                defaultSelectedKeys={["1"]}
                className="flex-1 border-none"
              >
                <Menu.Item key="1" icon={<FolderOutlined />}>
                  <Link to="/">File Manager</Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<SearchOutlined />}>
                  <Link to="/search">Advanced Search</Link>
                </Menu.Item>
              </Menu>
            </Header>
            <Content className="bg-slate-50">
              <Routes>
                <Route path="/" element={<FileManager2 />} />
                <Route path="/search" element={<AdvancedSearchPage />} />
              </Routes>
            </Content>
          </Layout>
        </BrowserRouter>
      </FolderTreeProvider>
    </QueryClientProvider>
  );
}

export default App;

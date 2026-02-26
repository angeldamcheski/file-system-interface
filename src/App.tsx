import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FileManager from "./components/FileManager";
import { FolderTreeProvider } from "./context/FolderTreeContext";
import FolderPanelMenager from "./components/FolderPanelMenager";
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
        {/* <FileManager /> */}
        <FolderPanelMenager />
      </FolderTreeProvider>
    </QueryClientProvider>
  );
}

export default App;

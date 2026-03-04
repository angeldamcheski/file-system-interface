import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FileManager2 from "./components/FileManager2";
import { FolderTreeProvider } from "./context/FolderTreeContext";
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
        <FileManager2 />
      </FolderTreeProvider>
    </QueryClientProvider>
  );
}

export default App;

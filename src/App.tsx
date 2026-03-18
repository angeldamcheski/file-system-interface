import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FolderTreeProvider } from "./context/FolderTreeContext";
import { BrowserRouter } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
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
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </FolderTreeProvider>
    </QueryClientProvider>
  );
}

export default App;

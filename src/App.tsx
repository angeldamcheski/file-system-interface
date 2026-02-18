import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FileManager from "./components/FileManager";
function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <FileManager />
      </QueryClientProvider>
    </>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import Navbar from '@/components/Navbar';
import DashboardPage from '@/pages/DashboardPage';
import LogExplorerPage from '@/pages/LogExplorerPage';
import HistoryPage from '@/pages/HistoryPage';

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <main className="max-w-screen-xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/logs" element={<LogExplorerPage />} />
              <Route path="/history" element={<HistoryPage />} />
              {/* Fallback: redirect ke dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;

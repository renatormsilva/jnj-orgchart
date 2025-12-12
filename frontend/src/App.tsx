import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { PeopleList } from './pages/PeopleList';
import { HierarchyView } from './pages/HierarchyView';
import { NotFound } from './pages/NotFound';
import { ToastContainer } from './components/common/Toast';
import { useToastStore } from './hooks/useToast';
import { ROUTES } from './utils/constants';
import { initializeAnalytics, trackPageView } from './utils/analytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

initializeAnalytics();

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return null;
}

function App() {
  const { toasts, removeToast } = useToastStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnalyticsTracker />
        <Layout>
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.PEOPLE} element={<PeopleList />} />
            <Route path={ROUTES.HIERARCHY} element={<HierarchyView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

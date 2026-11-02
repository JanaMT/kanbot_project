import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { AppThemeProvider } from '../shared/theme/ThemeProvider';
import { router } from './router';
import { RouteLoadingFallback } from '../shared/components/RouteLoadingFallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Suspense fallback={<RouteLoadingFallback />}>
            <RouterProvider router={router} />
          </Suspense>
        </SnackbarProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

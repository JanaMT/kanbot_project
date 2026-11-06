import { useMemo, useState, useEffect, createContext, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }
  return context;
}

function getInitialMode(): ThemeMode {
  // Check localStorage first
  const saved = localStorage.getItem('kanbot-mode');
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  
  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // Default to light
  return 'light';
}

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem('kanbot-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode - Softer, less harsh
                primary: {
                  main: '#1E293B',        // Softer navy (was #0F172A - too dark)
                  contrastText: '#FFFFFF',
                },
                secondary: {
                  main: '#64748B',
                  contrastText: '#FFFFFF',
                },
                background: {
                  default: '#F8FAFC',     // Soft blue-grey background
                  paper: '#FFFFFF',
                },
                text: {
                  primary: '#1E293B',     // Softer text (was #0F172A)
                  secondary: '#64748B',
                },
                divider: '#E2E8F0',
                success: {
                  main: '#16A34A',
                },
                warning: {
                  main: '#D97706',
                },
                error: {
                  main: '#DC2626',
                },
                action: {
                  hover: 'rgba(0, 0, 0, 0.04)',      // Softer hover
                  selected: 'rgba(0, 0, 0, 0.08)',   // Softer selection
                  disabled: 'rgba(0, 0, 0, 0.26)',
                  disabledBackground: 'rgba(0, 0, 0, 0.12)',
                },
              }
            : {
                // Dark mode
                primary: {
                  main: '#E2E8F0',
                  contrastText: '#0F172A',
                },
                secondary: {
                  main: '#94A3B8',
                  contrastText: '#0F172A',
                },
                background: {
                  default: '#0F172A',
                  paper: '#1E293B',
                },
                text: {
                  primary: '#F8FAFC',
                  secondary: '#94A3B8',
                },
                divider: '#334155',
                success: {
                  main: '#22C55E',
                },
                warning: {
                  main: '#F59E0B',
                },
                error: {
                  main: '#EF4444',
                },
              }),
        },
        shape: {
          borderRadius: 10,
        },
        typography: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow:
                  mode === 'light'
                    ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                    : '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
                border: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

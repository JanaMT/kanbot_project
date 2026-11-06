import { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { login } from '../../shared/api/auth';
import { useAuthStore } from './authStore';
import { ApiError } from '../../shared/api/client';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.token, data.user);
      
      // Get redirect path and validate it's safe
      const redirect = searchParams.get('redirect');
      let targetPath = '/projects';
      
      if (redirect) {
        // Reject external redirects (https://, //, etc.)
        if (!redirect.startsWith('http') && !redirect.startsWith('//')) {
          targetPath = redirect;
        }
      }
      
      navigate(targetPath, { replace: true });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const serverError = loginMutation.error instanceof ApiError && loginMutation.error.status === 401
    ? loginMutation.error.message
    : null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Card 
          sx={{ 
            p: { xs: 3, sm: 4 },
            boxShadow: 3,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                mb: 1,
              }}
            >
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Log in to your account to continue
            </Typography>
          </Box>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              margin="normal"
              autoFocus
              disabled={loginMutation.isPending}
              slotProps={{
                htmlInput: {
                  autoComplete: 'email',
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              margin="normal"
              disabled={loginMutation.isPending}
              slotProps={{
                htmlInput: {
                  autoComplete: 'current-password',
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        disabled={loginMutation.isPending}
                        tabIndex={0}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2.5 }}
              disabled={loginMutation.isPending}
              startIcon={loginMutation.isPending ? <CircularProgress size={20} /> : undefined}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link
              component="button"
              type="button"
              onClick={() => navigate('/register')}
              sx={{ cursor: 'pointer' }}
              disabled={loginMutation.isPending}
            >
              Sign up
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}

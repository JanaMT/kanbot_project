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
} from '@mui/material';
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
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <img
              src="/brand/kanbot-logo.svg"
              alt="Kanbot"
              style={{ height: 48 }}
            />
          </Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log in to your account to continue
          </Typography>
        </Box>

        <Card sx={{ p: 4 }}>
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
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              margin="normal"
              disabled={loginMutation.isPending}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loginMutation.isPending}
              startIcon={loginMutation.isPending ? <CircularProgress size={20} /> : undefined}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <Typography variant="body2" align="center" color="text.secondary">
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

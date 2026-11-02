import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { register as registerUser } from '../../shared/api/auth';
import { useAuthStore } from './authStore';
import { ApiError, getFieldErrors } from '../../shared/api/client';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name must be 80 characters or less'),
  email: z.string().email('Enter a valid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200, 'Password is too long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setSession(data.token, data.user);
      navigate('/projects', { replace: true });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const fieldErrors = getFieldErrors(error);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof RegisterFormData, {
            type: 'server',
            message,
          });
        });
      }
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

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
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start managing your sprints with AI
          </Typography>
        </Box>

        <Card sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              margin="normal"
              autoFocus
              disabled={registerMutation.isPending}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              margin="normal"
              disabled={registerMutation.isPending}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message || 'At least 8 characters'}
              margin="normal"
              disabled={registerMutation.isPending}
            />
            <TextField
              fullWidth
              label="Confirm password"
              type="password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              margin="normal"
              disabled={registerMutation.isPending}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={registerMutation.isPending}
              startIcon={registerMutation.isPending ? <CircularProgress size={20} /> : undefined}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <Typography variant="body2" align="center" color="text.secondary">
            Already have an account?{' '}
            <Link
              component="button"
              type="button"
              onClick={() => navigate('/login')}
              sx={{ cursor: 'pointer' }}
              disabled={registerMutation.isPending}
            >
              Log in
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}

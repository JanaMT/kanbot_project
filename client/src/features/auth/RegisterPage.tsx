import { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        py: 3,
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
              Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start managing your sprints with AI
            </Typography>
          </Box>

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
              slotProps={{
                htmlInput: {
                  autoComplete: 'name',
                },
              }}
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
              helperText={errors.password?.message || 'At least 8 characters'}
              margin="normal"
              disabled={registerMutation.isPending}
              slotProps={{
                htmlInput: {
                  autoComplete: 'new-password',
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        disabled={registerMutation.isPending}
                        tabIndex={0}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              margin="normal"
              disabled={registerMutation.isPending}
              slotProps={{
                htmlInput: {
                  autoComplete: 'new-password',
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        disabled={registerMutation.isPending}
                        tabIndex={0}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              disabled={registerMutation.isPending}
              startIcon={registerMutation.isPending ? <CircularProgress size={20} /> : undefined}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 2 }}>
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

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { getUserProfileApi } from '../api/authApi';
import { loginStart, loginSuccess, loginFailure, setProfile } from '../store/authSlice';
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '../utils/validation';

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      dispatch(loginStart());
      try {
        const res = await authService.login(data);
        return res;
      } catch (error: any) {
        dispatch(loginFailure(error.message || 'Failed to sign in'));
        throw error;
      }
    },
    onSuccess: async (res) => {
      // Dispatch loginSuccess to store credentials in Redux and localStorage
      dispatch(
        loginSuccess({
          accessToken: res.accessToken,
          idToken: res.idToken,
          refreshToken: res.refreshToken,
          expiration: res.expiration,
          user: { email: res.user.email },
        })
      );

      // Immediately fetch user profile
      try {
        const profile = await getUserProfileApi();
        dispatch(setProfile(profile));
      } catch (err: any) {
        console.error('Profile fetch failed, using fallback', err);
        // Fallback profile if backend /profile is not active
        dispatch(
          setProfile({
            email: res.user.email,
            fullName: 'NatCart Shopper',
            role: 'user',
          })
        );
      }

      toast.success('Welcome back to NatCart!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sign in. Please try again.');
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (res) => {
      toast.success('Account created! Please verify your email.');
      // Pass email as both email and token for validation flow
      navigate('/auth/verify-otp', { state: { email: res.user.email, token: res.user.email } });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed.');
    },
  });
};

export const useVerifyOTP = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ otp, token }: { otp: string; token: string | null }) =>
      authService.verifyOTP(otp, token || ''),
    onSuccess: (res) => {
      toast.success(res.message);
      navigate('/auth/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Verification failed. Try again.');
    },
  });
};

export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => authService.forgotPassword(data),
    onSuccess: (res, variables) => {
      toast.success(res.message);
      // Pass email and isResetFlow state
      navigate('/auth/verify-otp', {
        state: { email: variables.email, token: variables.email, isResetFlow: true },
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Recovery failed.');
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordInput & { email: string; otp: string }) =>
      authService.resetPassword(data),
    onSuccess: (res) => {
      toast.success(res.message);
      navigate('/auth/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Password reset failed.');
    },
  });
};

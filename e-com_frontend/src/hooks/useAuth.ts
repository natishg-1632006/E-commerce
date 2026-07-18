import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { getUserProfileApi } from '../api/authApi';
import { loginStart, loginSuccess, loginFailure, setProfile } from '../store/authSlice';
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '../utils/validation';
import { getRoleFromToken, getNameFromToken } from '../utils/jwtDecode';

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
      // Decode Cognito ID token to extract role from cognito:groups / custom:role
      const resolvedRole = getRoleFromToken(res.idToken);
      const resolvedName = getNameFromToken(res.idToken, res.user.email);

      // Dispatch loginSuccess to store credentials in Redux and localStorage
      dispatch(
        loginSuccess({
          accessToken: res.accessToken,
          idToken: res.idToken,
          refreshToken: res.refreshToken,
          expiration: res.expiration,
          user: { email: res.user.email },
          role: resolvedRole,
        })
      );

      // Fetch profile from backend; fall back to token-derived values
      try {
        const profile = await getUserProfileApi();
        dispatch(setProfile({
          ...profile,
          // Token-decoded role takes priority over backend profile.role
          // because cognito:groups is the authoritative source of truth
          role: resolvedRole,
          fullName: profile.fullName || resolvedName,
        }));
      } catch (err: any) {
        console.error('Profile fetch failed, using token claims as fallback', err);
        dispatch(
          setProfile({
            email: res.user.email,
            fullName: resolvedName,
            role: resolvedRole,
          })
        );
      }

      toast.success('Welcome back to NatCart!');
      // Route admin to admin dashboard, regular users to marketplace
      navigate(resolvedRole === 'admin' ? '/admin' : '/');
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

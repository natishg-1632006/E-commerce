import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { resetPasswordSchema } from '../../utils/validation';
import type { ResetPasswordInput } from '../../utils/validation';
import { useResetPassword } from '../../hooks/useAuth';

import AuthLayout from '../../components/auth/AuthLayout';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthFooter from '../../components/auth/AuthFooter';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordStrength from '../../components/auth/PasswordStrength';
import AuthButton from '../../components/auth/AuthButton';
import resetPasswordIllustration from '../../assets/auth/illustrations/reset-password.png';

export const ResetPassword: React.FC = () => {
  const location = useLocation();
  const { email = '', otp = '' } = (location.state || {}) as { email?: string; otp?: string; };
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = (data: ResetPasswordInput) => {
    resetPassword({ ...data, email, otp });
  };

  return (
    <AuthLayout
      illustrationSrc={resetPasswordIllustration}
      promoTitle="Secure Your Account"
      promoDesc="Create a strong password to protect your shipping address, billing info, and orders history."
    >
      <div className="flex-1 flex flex-col justify-center my-auto w-full">
        <AuthHeader
          title="Reset Password"
          subtitle="Create a strong password for your NatCart account."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <PasswordInput
            id="password"
            label="New Password"
            error={errors.password?.message}
            {...register('password')}
          />

          {passwordValue && <PasswordStrength value={passwordValue} />}

          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <AuthButton type="submit" isLoading={isPending} className="mt-2.5">
            Reset Password
          </AuthButton>
        </form>

        <div className="mt-4 pt-3.5 border-t border-slate-100/60 text-center">
          <Link
            to="/auth/login"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default ResetPassword;

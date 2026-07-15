import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema } from '../../utils/validation';
import type { ForgotPasswordInput } from '../../utils/validation';
import { useForgotPassword } from '../../hooks/useAuth';

import AuthLayout from '../../components/auth/AuthLayout';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthFooter from '../../components/auth/AuthFooter';
import InputField from '../../components/auth/InputField';
import AuthButton from '../../components/auth/AuthButton';
import forgotPasswordIllustration from '../../assets/auth/illustrations/forgot-password.png';

export const ForgotPassword: React.FC = () => {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword(data);
  };

  return (
    <AuthLayout
      illustrationSrc={forgotPasswordIllustration}
      promoTitle="Restore Your Account"
      promoDesc="Verify your identity to retrieve your technology cart items and safely change your credentials."
    >
      <div className="flex-1 flex flex-col justify-center my-auto w-full">
        <AuthHeader
          title="Forgot Password"
          subtitle="Recover your account securely. Enter your registered email address below."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <InputField
            id="email"
            type="email"
            label="Email Address"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <AuthButton type="submit" isLoading={isPending} className="mt-2.5">
            Send OTP
            <ArrowRight className="w-4 h-4 ml-1" />
          </AuthButton>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-100/60">
          <Link
            to="/auth/login"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default ForgotPassword;

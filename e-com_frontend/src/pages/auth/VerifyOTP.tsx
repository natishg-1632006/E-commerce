import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { otpSchema } from '../../utils/validation';
import type { OTPInputType } from '../../utils/validation';
import { useVerifyOTP } from '../../hooks/useAuth';
import { useCountdown } from '../../hooks/useCountdown';
import { authService } from '../../services/auth.service';

import AuthLayout from '../../components/auth/AuthLayout';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthFooter from '../../components/auth/AuthFooter';
import OTPInput from '../../components/auth/OTPInput';
import AuthButton from '../../components/auth/AuthButton';
import verifyOTPIllustration from '../../assets/auth/illustrations/verify-otp.png';

export const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email = 'u***r@example.com', token = null, isResetFlow = false } = (location.state || {}) as {
    email?: string;
    token?: string | null;
    isResetFlow?: boolean;
  };

  const { mutate: verifyOtp, isPending } = useVerifyOTP();
  const { formattedTime, isActive, resetCountdown } = useCountdown(120);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPInputType>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = (data: OTPInputType) => {
    if (isResetFlow) {
      navigate('/auth/reset-password', { state: { email, otp: data.otp } });
    } else {
      verifyOtp({ otp: data.otp, token });
    }
  };

  const handleResend = async () => {
    if (isActive) return;
    try {
      await authService.resendOTP(email);
      resetCountdown();
      toast.success('A new verification code has been sent to your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification code.');
    }
  };

  const maskEmail = (emailStr: string) => {
    const [name, domain] = emailStr.split('@');
    if (!name || !domain) return emailStr;
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  };

  return (
    <AuthLayout
      illustrationSrc={verifyOTPIllustration}
      promoTitle="Secure Access Verification"
      promoDesc="Safeguard your tech inventory, shopping cart, and transaction details with multi-factor verification."
    >
      <div className="flex-1 flex flex-col justify-center my-auto w-full">
        <AuthHeader
          title="Verify OTP"
          subtitle={
            <span>
              Enter the verification code sent to your email{' '}
              <strong className="text-blue-600 font-semibold">{maskEmail(email)}</strong>.
            </span>
          }
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <OTPInput
                value={field.value}
                onChange={field.onChange}
                error={errors.otp?.message}
              />
            )}
          />

          <AuthButton type="submit" isLoading={isPending} className="mt-4">
            Verify
          </AuthButton>

          <div className="flex items-center justify-between mt-4 text-xs font-semibold">
            <div className="flex items-center text-slate-500 space-x-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{formattedTime}</span>
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={isActive}
              className={`transition-colors font-bold ${
                isActive 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-blue-600 hover:text-blue-700 cursor-pointer'
              }`}
            >
              Resend OTP
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100/60">
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

export default VerifyOTP;

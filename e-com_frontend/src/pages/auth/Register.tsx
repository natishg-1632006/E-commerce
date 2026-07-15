import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { registerSchema } from '../../utils/validation';
import type { RegisterInput } from '../../utils/validation';
import { useRegister } from '../../hooks/useAuth';

import AuthLayout from '../../components/auth/AuthLayout';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthFooter from '../../components/auth/AuthFooter';
import InputField from '../../components/auth/InputField';
import PasswordInput from '../../components/auth/PasswordInput';
import PasswordStrength from '../../components/auth/PasswordStrength';
import RememberMe from '../../components/auth/RememberMe';
import AuthButton from '../../components/auth/AuthButton';
import registerIllustration from '../../assets/auth/illustrations/register.png';

export const Register: React.FC = () => {
  const { mutate: registerUser, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = (data: RegisterInput) => {
    registerUser(data);
  };

  return (
    <AuthLayout
      illustrationSrc={registerIllustration}
      promoTitle="Start Shopping Today"
      promoDesc="Create an account to save carts, track orders, and get personalized hardware recommendations."
    >
      <div className="flex-1 flex flex-col justify-center my-auto w-full">
        <AuthHeader
          title="Create Account"
          subtitle="Join NatCart today and explore the latest technology products."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <InputField
            id="email"
            type="email"
            label="Email Address"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordInput
            id="password"
            label="Password"
            error={errors.password?.message}
            {...register('password')}
          />

          {passwordValue && (
            <div className="mb-1.5">
              <PasswordStrength value={passwordValue} />
            </div>
          )}

          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="flex items-center my-1.5">
            <RememberMe
              id="acceptTerms"
              label="I accept the Terms of Service and Privacy Policy."
              required
            />
          </div>

          <AuthButton type="submit" isLoading={isPending}>
            Create Account
            <ArrowRight className="w-4 h-4 ml-1" />
          </AuthButton>
        </form>

        <div className="text-center mt-2.5 text-xs font-semibold text-slate-500">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default Register;

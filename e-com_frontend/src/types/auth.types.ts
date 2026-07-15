export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  otpRequired?: boolean;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  token?: string;
}

export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordRuleState {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

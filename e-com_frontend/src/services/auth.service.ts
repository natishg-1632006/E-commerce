import type { AuthResponse, VerificationResponse, User } from '../types/auth.types';
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '../utils/validation';
import { callCognito, COGNITO_CLIENT_ID } from '../api/authApi';

class AuthService {
  async login(data: LoginInput): Promise<any> {
    const payload = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: data.email,
        PASSWORD: data.password,
      },
    };

    const result = await callCognito('InitiateAuth', payload);
    const authResult = result.AuthenticationResult;

    const mockUser: User = {
      id: 'usr_' + data.email.replace(/[^a-zA-Z0-9]/g, ''),
      email: data.email,
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem('natcart_access_token', authResult.AccessToken);
    localStorage.setItem('natcart_token', authResult.AccessToken); // fallback
    localStorage.setItem('natcart_id_token', authResult.IdToken);
    localStorage.setItem('natcart_refresh_token', authResult.RefreshToken);
    localStorage.setItem('natcart_token_expiration', new Date(Date.now() + authResult.ExpiresIn * 1000).toISOString());
    localStorage.setItem('natcart_user', JSON.stringify(mockUser));

    return {
      user: mockUser,
      token: authResult.AccessToken,
      accessToken: authResult.AccessToken,
      idToken: authResult.IdToken,
      refreshToken: authResult.RefreshToken,
      expiration: new Date(Date.now() + authResult.ExpiresIn * 1000).toISOString(),
    };
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const payload = {
      ClientId: COGNITO_CLIENT_ID,
      Username: data.email,
      Password: data.password,
      UserAttributes: [
        {
          Name: 'email',
          Value: data.email,
        },
      ],
    };

    await callCognito('SignUp', payload);

    const mockUser: User = {
      id: 'usr_' + data.email.replace(/[^a-zA-Z0-9]/g, ''),
      email: data.email,
      createdAt: new Date().toISOString(),
    };

    return {
      user: mockUser,
      token: 'verification-pending',
      otpRequired: true,
    };
  }

  async verifyOTP(otp: string, email: string): Promise<VerificationResponse> {
    const payload = {
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: otp,
    };

    await callCognito('ConfirmSignUp', payload);

    return {
      success: true,
      message: 'Email verified successfully. You can now login.',
    };
  }

  async resendOTP(email: string): Promise<VerificationResponse> {
    const payload = {
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
    };

    await callCognito('ResendConfirmationCode', payload);

    return {
      success: true,
      message: 'A new verification code has been sent to your email.',
    };
  }

  async forgotPassword(data: ForgotPasswordInput): Promise<VerificationResponse> {
    const payload = {
      ClientId: COGNITO_CLIENT_ID,
      Username: data.email,
    };

    await callCognito('ForgotPassword', payload);

    return {
      success: true,
      message: 'Verification code sent to your email.',
    };
  }

  async resetPassword(data: ResetPasswordInput & { email: string; otp: string }): Promise<VerificationResponse> {
    const payload = {
      ClientId: COGNITO_CLIENT_ID,
      Username: data.email,
      ConfirmationCode: data.otp,
      Password: data.password,
    };

    await callCognito('ConfirmForgotPassword', payload);

    return {
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    };
  }

  logout(): void {
    localStorage.removeItem('natcart_access_token');
    localStorage.removeItem('natcart_token');
    localStorage.removeItem('natcart_id_token');
    localStorage.removeItem('natcart_refresh_token');
    localStorage.removeItem('natcart_token_expiration');
    localStorage.removeItem('natcart_user');
    localStorage.removeItem('natcart_profile');
    localStorage.removeItem('natcart_role');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('natcart_access_token');
    const expiration = localStorage.getItem('natcart_token_expiration');
    if (!token) return false;
    if (expiration) {
      const isExpired = new Date(expiration).getTime() < Date.now();
      if (isExpired) {
        this.logout();
        return false;
      }
    }
    return true;
  }
}

export const authService = new AuthService();
export default authService;

export const APP_NAME = 'NatCart';

export const SOCIAL_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: 'google',
    bgColor: 'hover:bg-red-50/50',
    borderColor: 'hover:border-red-200',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    bgColor: 'hover:bg-slate-50/50',
    borderColor: 'hover:border-slate-300',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: 'microsoft',
    bgColor: 'hover:bg-blue-50/50',
    borderColor: 'hover:border-blue-200',
  },
] as const;

export const PASSWORD_RULES = [
  { key: 'hasMinLength', label: '8+ characters' },
  { key: 'hasUppercase', label: 'One uppercase letter' },
  { key: 'hasNumber', label: 'One number' },
  { key: 'hasSpecialChar', label: 'Special character' },
] as const;

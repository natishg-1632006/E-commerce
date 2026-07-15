import React, { useMemo } from 'react';
import { Check, Circle } from 'lucide-react';
import { clsx } from 'clsx';

interface PasswordStrengthProps {
  value: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ value = '' }) => {
  const rules = useMemo(() => {
    return {
      hasMinLength: value.length >= 8,
      hasUppercase: /[A-Z]/.test(value),
      hasNumber: /[0-9]/.test(value),
      hasSpecialChar: /[^A-Za-z0-9]/.test(value),
    };
  }, [value]);

  const score = useMemo(() => {
    return Object.values(rules).filter(Boolean).length;
  }, [rules]);

  const { strengthLabel, strengthColor, progressWidth } = useMemo(() => {
    if (!value) {
      return { strengthLabel: 'None', strengthColor: 'bg-slate-200', progressWidth: 'w-0' };
    }
    switch (score) {
      case 1:
        return { strengthLabel: 'Weak', strengthColor: 'bg-red-500', progressWidth: 'w-1/4' };
      case 2:
        return { strengthLabel: 'Fair', strengthColor: 'bg-orange-500', progressWidth: 'w-2/4' };
      case 3:
        return { strengthLabel: 'Good', strengthColor: 'bg-blue-500', progressWidth: 'w-3/4' };
      case 4:
        return { strengthLabel: 'Strong', strengthColor: 'bg-green-500', progressWidth: 'w-full' };
      default:
        return { strengthLabel: 'Weak', strengthColor: 'bg-red-500', progressWidth: 'w-1/12' };
    }
  }, [score, value]);

  return (
    <div className="w-full mt-1 mb-2.5">
      <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
        <span className="text-slate-400">Security Strength</span>
        {value && (
          <span className={clsx(
            score === 1 && "text-red-500",
            score === 2 && "text-orange-500",
            score === 3 && "text-blue-500",
            score === 4 && "text-green-500",
            "font-semibold"
          )}>
            {strengthLabel}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5">
        <div className={clsx("h-full transition-all duration-500 rounded-full", strengthColor, progressWidth)} />
      </div>

      {/* Grid checklist */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10.5px]">
        <div className="flex items-center space-x-2">
          {rules.hasMinLength ? (
            <Check className="w-3 h-3 text-blue-600 stroke-[3.5]" />
          ) : (
            <Circle className="w-3 h-3 text-slate-300" />
          )}
          <span className={clsx(rules.hasMinLength ? "text-slate-700 font-medium" : "text-slate-400")}>8+ characters</span>
        </div>
        <div className="flex items-center space-x-2">
          {rules.hasUppercase ? (
            <Check className="w-3 h-3 text-blue-600 stroke-[3.5]" />
          ) : (
            <Circle className="w-3 h-3 text-slate-300" />
          )}
          <span className={clsx(rules.hasUppercase ? "text-slate-700 font-medium" : "text-slate-400")}>One uppercase</span>
        </div>
        <div className="flex items-center space-x-2">
          {rules.hasNumber ? (
            <Check className="w-3 h-3 text-blue-600 stroke-[3.5]" />
          ) : (
            <Circle className="w-3 h-3 text-slate-300" />
          )}
          <span className={clsx(rules.hasNumber ? "text-slate-700 font-medium" : "text-slate-400")}>One number</span>
        </div>
        <div className="flex items-center space-x-2">
          {rules.hasSpecialChar ? (
            <Check className="w-3 h-3 text-blue-600 stroke-[3.5]" />
          ) : (
            <Circle className="w-3 h-3 text-slate-300" />
          )}
          <span className={clsx(rules.hasSpecialChar ? "text-slate-700 font-medium" : "text-slate-400")}>Special character</span>
        </div>
      </div>
    </div>
  );
};
export default PasswordStrength;

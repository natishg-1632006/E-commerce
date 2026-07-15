import React, { useEffect } from 'react';
import { useOTP } from '../../hooks/useOTP';
import { clsx } from 'clsx';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, error }) => {
  const { otp, inputRefs, handleChange, handleKeyDown, handlePaste, setOtp } = useOTP(6, (code) => {
    onChange(code);
  });

  // Keep internal state aligned if value changes from outside (e.g. form resets)
  useEffect(() => {
    if (!value) {
      setOtp(Array(6).fill(''));
    } else if (value !== otp.join('')) {
      const parts = value.slice(0, 6).split('');
      setOtp([...parts, ...Array(6 - parts.length).fill('')]);
    }
  }, [value, setOtp]);

  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    handleChange(e, idx);
    // Align with parent state
    const newOtp = [...otp];
    newOtp[idx] = e.target.value.slice(-1);
    onChange(newOtp.join(''));
  };

  return (
    <div className="w-full">
      <div className="flex justify-between gap-2 my-4">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            ref={(el) => { inputRefs.current[idx] = el; }}
            onChange={(e) => handleDigitChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            className={clsx(
              "w-10 h-11 sm:w-11 sm:h-12 text-center text-lg font-bold bg-white border rounded-xl outline-none transition-all duration-300",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100/50"
                : "border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100/50",
              digit ? "border-slate-500 font-semibold" : "border-slate-400"
            )}
            aria-label={`Digit ${idx + 1} of verification code`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
export default OTPInput;

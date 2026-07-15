import { useState, useRef } from 'react';
import type { KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

export const useOTP = (length: number = 6, onComplete?: (code: string) => void) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    const singleDigit = val.slice(-1);
    if (val !== '' && !/^[0-9]$/.test(singleDigit)) return;

    const newOtp = [...otp];
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    const code = newOtp.join('');
    if (code.length === length && onComplete) {
      onComplete(code);
    }

    if (singleDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^[0-9]+$/.test(pasteData)) return;

    const digits = pasteData.slice(0, length).split('');
    const newOtp = [...otp];

    for (let i = 0; i < length; i++) {
      if (digits[i]) {
        newOtp[i] = digits[i];
      }
    }

    setOtp(newOtp);

    const focusIndex = Math.min(digits.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    const code = newOtp.join('');
    if (code.length === length && onComplete) {
      onComplete(code);
    }
  };

  const resetOtp = () => {
    setOtp(Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  return {
    otp,
    setOtp,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    resetOtp,
  };
};

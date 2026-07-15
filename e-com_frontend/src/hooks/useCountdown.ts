import { useState, useEffect, useCallback } from 'react';

export const useCountdown = (initialSeconds: number = 120) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  const resetCountdown = useCallback(() => {
    setSecondsRemaining(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const stopCountdown = useCallback(() => {
    setIsActive(false);
  }, []);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [secondsRemaining]);

  return {
    secondsRemaining,
    isActive,
    resetCountdown,
    stopCountdown,
    formattedTime: formatTime(),
  };
};

import { useEffect, useRef, useCallback } from 'react';

const useInactivity = (onInactive, timeoutMs = 90000) => {
  const timeoutRef = useRef(null);
  const onInactiveRef = useRef(onInactive);

  useEffect(() => {
    onInactiveRef.current = onInactive;
  }, [onInactive]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onInactiveRef.current();
    }, timeoutMs);
  }, [timeoutMs]);

  const stopTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { resetTimer, stopTimer };
};

export default useInactivity;
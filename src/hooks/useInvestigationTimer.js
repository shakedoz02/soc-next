import { useState, useEffect, useRef, useCallback } from 'react';

export function useInvestigationTimer(active = true) {
  const [elapsed, setElapsed]   = useState(0);
  const elapsedRef              = useRef(0);   // stable ref — safe to read inside callbacks
  const intervalRef             = useRef(null);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    if (!active) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed(t => {
        elapsedRef.current = t + 1;
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active]);

  const stop = useCallback(() => clearInterval(intervalRef.current), []);

  const formatTime = useCallback((s) => {
    const v = s ?? elapsedRef.current;
    const m = Math.floor(v / 60);
    const sec = v % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, []);

  return { elapsed, elapsedRef, stop, formatTime };
}

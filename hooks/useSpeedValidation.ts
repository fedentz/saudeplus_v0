import { useEffect, useRef, useState } from 'react';

/**
 * Placeholder hook to validate the user speed while tracking.
 * It calculates an average from the last few samples and marks the
 * activity as suspicious when it stays above 15 km/h.
 */
export default function useSpeedValidation(speed: number | null) {
  // speed parameter is expected in meters/second
  const [speedTooHigh, setSpeedTooHigh] = useState(false);
  const samplesRef = useRef<number[]>([]);

  useEffect(() => {
    if (speed == null) return;
    samplesRef.current.push(speed);
    if (samplesRef.current.length > 5) samplesRef.current.shift();

    const avg = samplesRef.current.reduce((acc, v) => acc + v, 0) / samplesRef.current.length;
    // 15 km/h -> 4.1666 m/s
    setSpeedTooHigh(avg > 15 / 3.6);
  }, [speed]);

  return { speedTooHigh };
}

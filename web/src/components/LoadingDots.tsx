import { useEffect, useState } from "react";

const dotCount = 10;
const dotDuration = 200;
const dotCharacter = "•";

interface Props {
  count?: number;
  duration?: number;
}

export const LoadingDots = ({ count = dotCount, duration = dotDuration }: Props) => {
  const [dots, setDots] = useState(dotCharacter);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === count ? dotCharacter : prev + dotCharacter));
    }, duration);

    return () => clearInterval(interval);
  }, [duration, count]);

  return <>{dots}</>;
};

import { useCallback, useRef, useState } from "react";

export function useComposition<T extends HTMLElement>({
  onKeyDown,
}: {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
} = {}) {
  const [isComposing, setIsComposing] = useState(false);
  const compositionEndTimeRef = useRef<number>(0);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
    compositionEndTimeRef.current = Date.now();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<T>) => {
      // Check if composition just ended (within 100ms)
      const justEndedComposing = Date.now() - compositionEndTimeRef.current < 100;
      
      // If composing or just ended composing, don't trigger the callback
      if (isComposing || justEndedComposing) {
        return;
      }

      onKeyDown?.(e);
    },
    [isComposing, onKeyDown]
  );

  return {
    isComposing,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  };
}


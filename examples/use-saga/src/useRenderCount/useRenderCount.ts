import { useRef } from "react";

// STATE: render count hook
export function useRenderCount() {
  const ref = useRef(0);
  ref.current = ref.current + 1;

  return ref.current;
}

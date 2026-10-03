import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Hydration-safe "are we on the client yet" flag (replaces useState+useEffect mounted hack). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

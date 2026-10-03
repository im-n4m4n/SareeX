"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * GSAP/ScrollTrigger scenes must tear down BEFORE React detaches their DOM.
 *
 * ScrollTrigger's "pin" moves the trigger element into a .pin-spacer wrapper.
 * When the setup lives in a passive useEffect, React removes the node first and
 * the effect cleanup runs afterwards — the revert then tries to unwrap a node
 * whose parent is already gone, which throws
 * "Failed to execute 'removeChild' on 'Node'" during a client-side navigation.
 *
 * A layout effect runs synchronously in the mutation phase, so the pin is
 * reverted while the tree is still attached. It is aliased to useEffect on the
 * server to avoid React's SSR warning.
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

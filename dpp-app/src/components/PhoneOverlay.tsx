"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PHONE_OVERLAY_ID } from "@/lib/appScrollLock";

const FRAME_QUERY = "(min-width: 768px)";

export function PhoneOverlay({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(FRAME_QUERY);
    const sync = () => {
      setTarget(mq.matches ? document.getElementById(PHONE_OVERLAY_ID) : null);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!target) return children;
  return createPortal(children, target);
}

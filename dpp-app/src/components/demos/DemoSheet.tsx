"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { lockAppScroll } from "@/lib/appScrollLock";
import { PhoneOverlay } from "@/components/PhoneOverlay";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  onReset: () => void;
  children: ReactNode;
};

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function DemoSheet({ open, title, onClose, onReset, children }: Props) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    return lockAppScroll();
  }, [open]);

  function trapTab(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <PhoneOverlay>
    <AnimatePresence>
      {open && (
        <div key="feature-sheet" className="fixed inset-0 z-[80] flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-fm-ink/40"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onKeyDown={trapTab}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: reduce ? 0 : 0.28, ease: "easeOut" }}
            className="relative flex h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <h2
                id={titleId}
                className="min-w-0 flex-1 font-display text-lg font-semibold text-fm-blue"
              >
                {title}
              </h2>
              <button type="button" onClick={onReset} className="btn-light min-h-[44px] shrink-0">
                Reset
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-xl text-fm-muted hover:bg-fm-surface hover:text-fm-ink"
                aria-label="Close"
              >
                <span className="text-2xl leading-none" aria-hidden>
                  ×
                </span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </PhoneOverlay>
  );
}

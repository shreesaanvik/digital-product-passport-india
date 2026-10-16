"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import {
  PHONE_OVERLAY_ID,
  PHONE_SCROLL_ID,
  PHONE_VIEWPORT_ID,
} from "@/lib/appScrollLock";
import styles from "./PhoneFrame.module.css";

const OUTER_W = 418;
const OUTER_H = 872;
const PANEL_AT = 1100;
const PANEL_SPACE = 336;
const PAD_X = 48;
const PAD_Y = 48;

function applyPhoneScale() {
  const panel = window.innerWidth >= PANEL_AT ? PANEL_SPACE : 0;
  const availH = window.innerHeight - PAD_Y;
  const availW = window.innerWidth - PAD_X - panel;
  let next = Math.min(1, availH / OUTER_H, availW / OUTER_W);
  if (!Number.isFinite(next) || next <= 0) next = 1;
  next = Math.floor(next * 1000) / 1000;
  document.documentElement.style.setProperty("--dpp-phone-scale", String(next));
}

const SCALE_BOOT = `function dppApplyPhoneScale(){var panel=window.innerWidth>=${PANEL_AT}?${PANEL_SPACE}:0,availH=window.innerHeight-${PAD_Y},availW=window.innerWidth-${PAD_X}-panel,next=Math.min(1,availH/${OUTER_H},availW/${OUTER_W});if(!isFinite(next)||next<=0)next=1;next=Math.floor(next*1000)/1000;document.documentElement.style.setProperty("--dpp-phone-scale",String(next));}dppApplyPhoneScale();window.addEventListener("resize",dppApplyPhoneScale);`;

type Props = {
  children: ReactNode;
};

function measurePhoneChrome(viewport: HTMLElement, home: HTMLElement | null) {
  const frame = window.matchMedia("(min-width: 768px)").matches;
  if (!frame) {
    viewport.style.removeProperty("--dpp-nav-h");
    viewport.style.removeProperty("--dpp-home-h");
    return;
  }
  const nav = viewport.querySelector('nav[aria-label="Main"]');
  const navH = nav instanceof HTMLElement ? nav.offsetHeight : 0;
  let homeH = 0;
  if (home && home.offsetHeight > 0) {
    const bottom = parseFloat(getComputedStyle(home).bottom) || 0;
    homeH = home.offsetHeight + bottom;
  }
  viewport.style.setProperty("--dpp-nav-h", `${navH}px`);
  viewport.style.setProperty("--dpp-home-h", `${homeH}px`);
}

export function PhoneFrame({ children }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyPhoneScale();
    window.addEventListener("resize", applyPhoneScale);
    const panelMq = window.matchMedia(`(min-width: ${PANEL_AT}px)`);
    panelMq.addEventListener("change", applyPhoneScale);
    return () => {
      window.removeEventListener("resize", applyPhoneScale);
      panelMq.removeEventListener("change", applyPhoneScale);
    };
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      measurePhoneChrome(viewport, homeRef.current);
      const nav = viewport.querySelector('nav[aria-label="Main"]');
      if (nav instanceof HTMLElement) ro.observe(nav);
    };
    const ro = new ResizeObserver(apply);
    ro.observe(viewport);
    if (homeRef.current) ro.observe(homeRef.current);
    const mo = new MutationObserver(apply);
    mo.observe(viewport, { childList: true, subtree: true });
    mq.addEventListener("change", apply);
    apply();
    return () => {
      ro.disconnect();
      mo.disconnect();
      mq.removeEventListener("change", apply);
    };
  }, []);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCALE_BOOT }} />
      <div className={styles.root}>
        <aside className={styles.panel}>
          <Image
            src="/logo.png"
            alt="Fashion Mingle"
            width={172}
            height={28}
            className={styles.logo}
            style={{
              width: "auto",
              height: "28px",
              maxWidth: "none",
              objectFit: "contain",
              aspectRatio: "4117 / 669",
            }}
            priority
          />
          <p className={styles.title}>Digital Product Passport · India</p>
          <p className={styles.note}>Demo with sample data</p>
          <p className={styles.note}>Use the phone to explore the app</p>
        </aside>
        <div className={styles.slot}>
          <div className={styles.device}>
            <div
              id={PHONE_VIEWPORT_ID}
              ref={viewportRef}
              className={styles.viewport}
            >
              <div className={styles.islandSlot} aria-hidden="true">
                <div className={styles.island} />
              </div>
              <div id={PHONE_SCROLL_ID} className={styles.screen}>
                {children}
              </div>
              <div id={PHONE_OVERLAY_ID} className={styles.overlay} />
              <div ref={homeRef} className={styles.home} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

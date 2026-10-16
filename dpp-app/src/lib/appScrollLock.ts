/** Outer phone screen. Holds the header in flow and does not scroll. */
export const PHONE_SCROLL_ID = "dpp-phone-scroll";

/** Page area under the header. This is what scrolls inside the phone. */
export const PHONE_PAGE_ID = "dpp-phone-page";

/** Sheets portal here so they stay on the phone viewport, not inside the page scroller. */
export const PHONE_OVERLAY_ID = "dpp-phone-overlay";

export const PHONE_VIEWPORT_ID = "dpp-phone-viewport";

const FRAME_QUERY = "(min-width: 768px)";

export function scrollPhoneToTop() {
  if (typeof window === "undefined") return;
  if (!window.matchMedia(FRAME_QUERY).matches) return;
  const page = document.getElementById(PHONE_PAGE_ID);
  if (page) page.scrollTop = 0;
}

type LockState = {
  el: HTMLElement;
  previous: string;
  scrollTop: number;
};

function scrollTarget(frameOn: boolean): HTMLElement | null {
  if (!frameOn) return document.body;
  return (
    document.getElementById(PHONE_PAGE_ID) ?? document.getElementById(PHONE_SCROLL_ID)
  );
}

export function lockAppScroll(): () => void {
  const mq = window.matchMedia(FRAME_QUERY);
  let current: LockState | null = null;

  const release = () => {
    if (!current) return;
    current.el.style.overflow = current.previous;
    if (current.el.id === PHONE_PAGE_ID || current.el.id === PHONE_SCROLL_ID) {
      current.el.scrollTop = current.scrollTop;
    }
    current = null;
  };

  const apply = () => {
    const el = scrollTarget(mq.matches);
    if (!el || current?.el === el) return;
    release();
    current = {
      el,
      previous: el.style.overflow,
      scrollTop: el.scrollTop,
    };
    el.style.overflow = "hidden";
  };

  apply();
  mq.addEventListener("change", apply);

  return () => {
    mq.removeEventListener("change", apply);
    release();
  };
}

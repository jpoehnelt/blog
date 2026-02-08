import { getContext, setContext } from "svelte";

export type AdStatus = "unknown" | "allowed" | "blocked";

const AD_CONTEXT_KEY = Symbol.for("ad-context");

/**
 * Reactive ad state managed via Svelte context.
 * Tracks whether ads are allowed, blocked, or not yet determined.
 */
export class AdState {
  status: AdStatus = $state("unknown");

  /** Push an ad slot for rendering. No-op if ads are blocked or unknown. */
  pushAd(element?: Element | null) {
    if (this.status !== "allowed" || !element) return;
    if (element.hasAttribute("data-adsbygoogle-status")) return;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {},
      );
    } catch {
      // adsbygoogle not available
    }
  }

  /** Push all uninitialized in-article ad slots on the page. */
  pushAllAds() {
    if (this.status !== "allowed") return;
    const slots = document.querySelectorAll(
      "ins.adsbygoogle:not([data-adsbygoogle-status])",
    );
    slots.forEach((slot) => this.pushAd(slot));
  }
}

/**
 * Create and provide ad context. Call once in a layout/provider component.
 */
export function setAds(): AdState {
  return setContext(AD_CONTEXT_KEY, new AdState());
}

/**
 * Consume ad context from a descendant component.
 */
export function useAds(): AdState {
  return getContext<AdState>(AD_CONTEXT_KEY);
}

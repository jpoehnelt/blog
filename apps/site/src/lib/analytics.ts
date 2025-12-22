export type GTagEvent = "link_click" | "code_copy";

export interface GTagEventParams {
  [key: string]: string | number | boolean;
}

export function sendEvent(
  eventName: GTagEvent,
  params: GTagEventParams
): void {
  if (import.meta.env.DEV) {
    console.log(`GA: ${eventName}`, params);
  }

  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
}

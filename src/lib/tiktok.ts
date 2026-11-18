declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
      identify: (params: Record<string, unknown>) => void;
      [key: string]: unknown;
    };
  }
}

// Thin wrapper around the TikTok pixel (ttq) loaded by TrackingScripts.
// No-ops safely when the pixel isn't loaded (tracking disabled, blocked, or server).
const track = (event: string, params?: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  window.ttq?.track(event, params);
};

export const tiktok = { track };

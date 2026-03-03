import type { DeviceType } from "@gamion/shared";

export function detectDevice(): DeviceType {
  if (typeof window === "undefined") return "desktop";

  const userAgent = navigator.userAgent.toLowerCase();

  const mobilePatterns = [
    /android/i,
    /iphone/i,
    /ipad/i,
    /ipod/i,
    /blackberry/i,
    /windows phone/i,
    /opera mini/i,
    /mobile/i,
  ];

  if (mobilePatterns.some((pattern) => pattern.test(userAgent))) {
    return "mobile";
  }

  if ("ontouchstart" in window && window.innerWidth < 768) {
    return "mobile";
  }

  return "desktop";
}

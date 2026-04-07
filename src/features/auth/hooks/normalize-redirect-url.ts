const REDIRECT_URL_ALLOW_LIST: Array<string> = [];

function getCurrentOrigin() {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.location.origin;
}

export function normalizeRedirectUrl(
  redirectTo: string | undefined,
  fallback: string,
) {
  const origin = getCurrentOrigin();
  const safeFallback = origin ? `${origin}${fallback}` : fallback;

  if (!redirectTo) {
    return safeFallback;
  }

  try {
    const normalizedUrl = new URL(redirectTo, origin ?? "http://localhost");
    const isSameOrigin = origin
      ? normalizedUrl.origin === origin
      : redirectTo.startsWith("/");
    const isAllowedExternalHostname = REDIRECT_URL_ALLOW_LIST.includes(
      normalizedUrl.hostname,
    );

    if (!isSameOrigin && !isAllowedExternalHostname) {
      return safeFallback;
    }

    if (normalizedUrl.pathname.startsWith("/api/")) {
      return `${normalizedUrl.pathname}${normalizedUrl.search}${normalizedUrl.hash}`;
    }

    if (isSameOrigin) {
      return origin
        ? normalizedUrl.toString()
        : `${normalizedUrl.pathname}${normalizedUrl.search}${normalizedUrl.hash}`;
    }

    return normalizedUrl.toString();
  } catch {
    return safeFallback;
  }
}

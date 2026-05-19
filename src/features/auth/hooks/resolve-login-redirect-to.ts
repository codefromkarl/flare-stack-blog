type SearchValue = string | number | boolean | null | undefined;

function normalizeSearchParams(
  locationSearch?: string | URLSearchParams | Record<string, SearchValue>,
) {
  if (!locationSearch) {
    return new URLSearchParams();
  }

  if (typeof locationSearch === "string" || locationSearch instanceof URLSearchParams) {
    return new URLSearchParams(locationSearch);
  }

  const params = new URLSearchParams();

  Object.entries(locationSearch).forEach(([key, value]) => {
    if (value == null) {
      return;
    }

    params.set(key, String(value));
  });

  return params;
}

export function resolveLoginRedirectTo({
  redirectTo,
  locationSearch,
}: {
  redirectTo?: string;
  locationSearch?: string | URLSearchParams | Record<string, SearchValue>;
}) {
  if (redirectTo) {
    return redirectTo;
  }

  const currentSearchParams = normalizeSearchParams(locationSearch);
  const isOAuthAuthorizationRequest =
    !!currentSearchParams.get("client_id") &&
    !!currentSearchParams.get("response_type");

  if (!isOAuthAuthorizationRequest) {
    return undefined;
  }

  return `/oauth/consent?${currentSearchParams.toString()}`;
}

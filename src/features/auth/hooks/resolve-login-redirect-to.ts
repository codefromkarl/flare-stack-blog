export function resolveLoginRedirectTo({
  redirectTo,
  locationSearch,
}: {
  redirectTo?: string;
  locationSearch?: string;
}) {
  if (redirectTo) {
    return redirectTo;
  }

  const currentSearchParams = new URLSearchParams(locationSearch ?? "");
  const isOAuthAuthorizationRequest =
    !!currentSearchParams.get("client_id") &&
    !!currentSearchParams.get("response_type");

  if (!isOAuthAuthorizationRequest) {
    return undefined;
  }

  return `/oauth/consent?${currentSearchParams.toString()}`;
}

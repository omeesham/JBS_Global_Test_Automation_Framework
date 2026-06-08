/**
 * URL host-matching helpers — defends against incomplete URL substring checks
 * (CodeQL js/incomplete-url-substring-sanitization).
 *
 * `someUrl.includes('login.microsoftonline.com')` returns true for
 * `login.microsoftonline.com.attacker.net` and for the host appearing in a
 * query string. Parse the host and compare exact-or-subdomain instead.
 *
 * Path/keyword heuristics that carry NO host (e.g. 'oauth', '/auth/sign-in',
 * 'error=OAuth', '401') are NOT a substring-sanitization concern and stay as
 * plain `.includes()` checks at the call sites.
 */

/** Microsoft Entra / Azure AD B2C sign-in hosts. */
export const AUTH_HOSTS = ['login.microsoftonline.com', 'b2clogin.com'] as const;

/** Lower-cased hostname of an absolute URL, or '' if it cannot be parsed. */
export function hostnameOf(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/** True when the URL's host is exactly `host` or a proper `.`-boundary subdomain of it. */
export function urlHostMatches(rawUrl: string, host: string): boolean {
  const h = hostnameOf(rawUrl);
  const t = host.toLowerCase();
  return h !== '' && (h === t || h.endsWith(`.${t}`));
}

/** True when the URL points at a known Microsoft auth host. */
export function isAuthUrl(rawUrl: string): boolean {
  return AUTH_HOSTS.some((h) => urlHostMatches(rawUrl, h));
}

/**
 * True when free text (e.g. an error message) EMBEDS an absolute URL whose host
 * is a Microsoft auth host. Extracts each `http(s)://…` token and host-matches it,
 * so a bare-host mention without a scheme is intentionally NOT matched here —
 * callers keep their keyword heuristics ('oauth', '401', …) for that case.
 */
export function textMentionsAuthUrl(text: string): boolean {
  return (text.match(/https?:\/\/[^\s'"]+/gi) ?? []).some(isAuthUrl);
}

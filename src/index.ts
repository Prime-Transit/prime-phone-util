import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

/**
 * Canonical phone format for storage and provider APIs (Telnyx, Firebase):
 * E.164 — e.g. "+15555555555". Always store/send the "+"-prefixed form.
 *
 * Accepts "+15555555555", "15555555555", "(555) 555-5555", "555-555-5555",
 * "5555555555" and international "+..." numbers. Bare national numbers are
 * parsed against `defaultCountry` (US) — never silently guess another region.
 */
const DEFAULT_COUNTRY: CountryCode = 'US';

/**
 * Normalize a phone number to E.164. Returns null when the input is empty
 * or cannot be parsed into a valid number — callers decide whether null
 * means "clear the field" (nullable column) or "reject the request".
 */
export function normalizePhone(
  input?: string | null,
  defaultCountry: CountryCode = DEFAULT_COUNTRY,
): string | null {
  if (input == null) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  const parsed = trimmed.startsWith('+')
    ? parsePhoneNumberFromString(trimmed)
    : parsePhoneNumberFromString(trimmed, defaultCountry);
  // isPossible() checks length/pattern; isValid() would reject reserved
  // ranges like US 555-xxxx which still need to store/send consistently.
  return parsed && parsed.isPossible() ? parsed.number : null;
}

/**
 * Like normalizePhone, but throws a TypeError on invalid input instead of
 * returning null. Use when a valid phone is required (SMS sends, 2FA).
 */
export function requirePhone(
  input: string | null | undefined,
  fieldName = 'phone',
  defaultCountry: CountryCode = DEFAULT_COUNTRY,
): string {
  const normalized = normalizePhone(input, defaultCountry);
  if (!normalized) throw new TypeError(`Invalid ${fieldName} number`);
  return normalized;
}

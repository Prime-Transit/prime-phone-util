# prime-phone-util

E.164 phone normalization used in production by [PRIME](https://primetransit.com) — the AI fleet management platform for independent operators and small-to-mid fleets.

Strict input, canonical output: every number stored or sent is `+15555555555` — never `15555555555`, `(555) 555-5555`, or `5555555555`. Built on `libphonenumber-js` with a `defaultCountry` fallback for bare national numbers and no silent region guessing.

```ts
import { normalizePhone, requirePhone } from 'prime-phone-util';

normalizePhone('(555) 555-5555');      // '+15555555555'
normalizePhone('+44 20 7946 0958');    // '+442079460958'
normalizePhone('not-a-number');        // null
requirePhone('555-555-5555', 'driver'); // '+15555555555' or throws TypeError
```

`normalizePhone` returns `null` for empty/unparseable input — callers decide whether null clears a nullable column or rejects the request. `requirePhone` throws when a valid number is mandatory.

## Why this exists

Phone numbers drift — `(555) 555-5555` in a web form, `5555555555` in a CSV import, `+15555555555` in an API. The E.164 canonical form (`+`-prefixed) is what SMS providers (Telnyx, Twilio) and Firebase Auth expect. One util at every write boundary keeps storage clean.

Extracted from [PRIME](https://primetransit.com), where this runs on user registration, referrals, 2FA, and every outbound SMS. MIT.

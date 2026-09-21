# EdgeSparkEstate CAC VAS and Email Configuration

## Required server-side variables

Add these variables to the **server environment**, not to client-side or `VITE_` variables:

```env
CAC_VAS_BASE_URL=https://<official-cac-vas-host>
CAC_VAS_VERIFY_ENDPOINT=/path-supplied-by-cac-vas
CAC_VAS_API_KEY=<secret-issued-by-cac-vas>
```

The application deliberately does not hard-code the CAC endpoint path because the official CAC VAS access contract, tenant, and endpoint can differ by issued account. Use the exact base URL, verification path, authentication secret, request field names, and rate limits supplied by CAC VAS.

The adapter sends a server-side `POST` request with this JSON payload:

```json
{
  "registrationNumber": "<applicant CAC number>",
  "entityName": "<optional applicant-declared company name>"
}
```

It accepts the common response shapes `cac`, `data`, `result`, or a top-level object and records only a concise verification summary and provider reference in EdgeSparkEstate. Raw provider responses and API keys are not exposed to browsers.

## Email notification variables

Verification status changes use the repository's SMTP sender. Configure these variables on the same server:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-mailbox@example.com
SMTP_PASS=<smtp-password-or-app-password>
EMAIL_FROM=EdgeSparkEstate <your-mailbox@example.com>
```

For Gmail, use an App Password rather than the normal account password when two-step verification is enabled. For a business mailbox, replace `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE` with the SMTP values supplied by the mailbox provider.

## Hostinger deployment steps

1. Open the hosting control panel for the Node.js application.
2. Open the application's **Environment variables** or **Application settings** section.
3. Add `CAC_VAS_BASE_URL`, `CAC_VAS_VERIFY_ENDPOINT`, and `CAC_VAS_API_KEY`.
4. Add the SMTP variables if owner email notifications are required.
5. Mark `CAC_VAS_API_KEY`, `SMTP_PASS`, and any mailbox credentials as secrets or protected values.
6. Do not place any of these values in `.env` files committed to GitHub.
7. Save the configuration and restart or redeploy the Node.js application. Environment variables are read when the server process starts.
8. Run a test verification from `/admin/verification` using a non-production or approved CAC test registration number.
9. Confirm that the admin queue records the provider result and that the owner receives the status-change email.

## Other hosting providers

Use the provider's server/runtime configuration area:

- **Render:** Service → Environment → Add Environment Variable → Manual Deploy.
- **Railway:** Project → Service → Variables → Deploy/Redeploy.
- **Fly.io:** `fly secrets set CAC_VAS_BASE_URL=... CAC_VAS_VERIFY_ENDPOINT=... CAC_VAS_API_KEY=...` followed by deploy.
- **Docker:** pass values through the runtime environment or a secrets manager; do not bake them into the image.
- **Traditional VPS:** store them in the process manager's environment configuration, such as `systemd` or PM2, then restart the service.

The names must remain exactly as listed above because the server adapter reads `process.env.CAC_VAS_BASE_URL`, `process.env.CAC_VAS_VERIFY_ENDPOINT`, and `process.env.CAC_VAS_API_KEY`.

## Behaviour when CAC is not configured

If any CAC variable is missing, the admin CAC action does not make an external request. It creates a `pending` manual-review check with the message:

> CAC VAS is not configured; an administrator must complete the approved manual verification route.

This prevents accidental requests to an unknown endpoint and keeps the workflow usable while access is being approved.

## Security checklist

- Keep CAC and SMTP values server-only.
- Never prefix these values with `VITE_`.
- Never log `CAC_VAS_API_KEY` or `SMTP_PASS`.
- Restrict admin access to the verification queue.
- Use HTTPS in production.
- Rotate provider and mailbox credentials if they are exposed.
- Verify the official CAC VAS endpoint and contract before enabling production checks.
- Treat a successful CAC business check as a business-registration signal, not proof that the entity owns a particular property.

## Verification email behaviour

When an admin changes a check from one status to another, EdgeSparkEstate sends the owner an email containing:

- The verification type.
- The new status.
- The result summary, when available.
- The reviewer note, when available.
- A prompt to sign in or contact the review team.

Email delivery is intentionally non-blocking: if SMTP is unavailable, the verification status remains saved and the server logs a delivery error for follow-up.

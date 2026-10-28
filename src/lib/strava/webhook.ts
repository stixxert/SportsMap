/**
 * Strava push-subscription plumbing.
 *
 * Deployment must not require any extra configuration beyond the Strava app credentials
 * the app already has: the verify token is derived from `CLIENT_SECRET`, and the
 * subscription registers itself once (idempotently) instead of needing a manual step.
 */

const SUBSCRIPTIONS_URL = "https://www.strava.com/api/v3/push_subscriptions";

const VERIFY_TOKEN_CONTEXT = "sports-map/strava-webhook/v1";

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Derives the webhook verify token from the client secret.
 *
 * No new secret to configure, and not guessable without the client secret. Rotating
 * `CLIENT_SECRET` rotates this with it.
 */
export async function deriveVerifyToken(clientSecret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(clientSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(VERIFY_TOKEN_CONTEXT),
  );

  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export type WebhookConfig = {
  clientId?: string;
  clientSecret?: string;
  publicOrigin?: string;
};

function isConfigured(
  config: WebhookConfig,
): config is Required<WebhookConfig> {
  return Boolean(config.clientId && config.clientSecret && config.publicOrigin);
}

/**
 * Ensures exactly one push subscription exists.
 *
 * Strava permits one per application, so this checks first and never replaces an
 * existing subscription (including one pointing at another environment). Safe to call on
 * every cold start.
 */
export async function ensureWebhookSubscription(
  config: WebhookConfig,
): Promise<"created" | "exists" | "skipped"> {
  if (!isConfigured(config)) return "skipped";

  const credentials = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const existing = await fetch(`${SUBSCRIPTIONS_URL}?${credentials}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (existing.ok) {
    const subscriptions = await existing.json();

    if (Array.isArray(subscriptions) && subscriptions.length > 0) {
      return "exists";
    }
  }

  const created = await fetch(SUBSCRIPTIONS_URL, {
    method: "POST",
    body: new URLSearchParams({
      ...Object.fromEntries(credentials),
      callback_url: `${config.publicOrigin.replace(/\/+$/, "")}/webhooks`,
      verify_token: await deriveVerifyToken(config.clientSecret),
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // 409 means another instance won the race (or one already exists) — that is success.
  if (created.status === 409) return "exists";

  if (!created.ok) {
    throw new Error(
      `Strava push subscription failed: ${created.status} ${created.statusText}`,
    );
  }

  return "created";
}

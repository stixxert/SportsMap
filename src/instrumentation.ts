/**
 * Registers the Strava push subscription on first server start.
 *
 * There is deliberately no manual deployment step: no extra secret (the verify token is
 * derived from CLIENT_SECRET) and no registration script. `ensureWebhookSubscription`
 * checks for an existing subscription first and never replaces one, so repeated cold
 * starts, preview deployments and restarts are all harmless.
 *
 * It is skipped outside production so local development never registers a localhost
 * callback with Strava.
 */

let attempted = false;

export async function register() {
  if (process.env.NODE_ENV !== "production") return;
  if (attempted) return;

  attempted = true;

  const { ensureWebhookSubscription } = await import("@/lib/strava/webhook");

  try {
    const result = await ensureWebhookSubscription({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      publicOrigin: process.env.NEXT_PUBLIC_DOMAIN,
    });

    if (result !== "skipped") {
      console.info(`Strava push subscription: ${result}`);
    }
  } catch (error) {
    // Never let webhook bookkeeping take the server down.
    console.error("Strava push subscription check failed", error);
  }
}

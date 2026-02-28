import { assembleUrl } from "@/utils/url";

const STRAVA_WEBHOOK_URL = "https://www.strava.com/api/v3/push_subscriptions";

// Strava requires web-hooks as a part of TOS - as we don't store data on a server,
// we omit actual implementation of processing these updates.

export async function register() {
  const client_id = process.env.NEXT_PUBLIC_CLIENT_ID;
  const client_secret = process.env.CLIENT_SECRET;
  const callback_url = process.env.NEXT_PUBLIC_DOMAIN;

  if (client_id && client_secret && callback_url) {
    const url = new URL(
      assembleUrl(STRAVA_WEBHOOK_URL, {
        client_id,
        client_secret,
        callback_url: `${callback_url}/webhooks`,
        verify_token: "ANY",
      }),
    );

    await fetch(url, { method: "POST" });
  }
}

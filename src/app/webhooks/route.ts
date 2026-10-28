/**
 * Strava push-subscription endpoint.
 *
 * Strava requires a webhook to exist as part of its API terms. This app stores nothing
 * server-side, so events are acknowledged and discarded — the endpoint is a handshake,
 * not a data sink.
 */

import { deriveVerifyToken } from "@/lib/strava/webhook";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" } as const;

/** Strava events are tiny; anything larger is not a Strava event. */
const MAX_EVENT_BYTES = 64 * 1024;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const mode = url.searchParams.get("hub.mode");
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = url.searchParams.get("hub.verify_token");
  const clientSecret = process.env.CLIENT_SECRET;

  // Fail closed: without the Strava client secret no handshake can be verified.
  if (!clientSecret) {
    return Response.json(
      { error: "webhook not configured" },
      { status: 503, headers: NO_STORE },
    );
  }

  if (mode !== "subscribe" || !challenge) {
    return Response.json(
      { error: "invalid verification request" },
      { status: 400, headers: NO_STORE },
    );
  }

  const expected = await deriveVerifyToken(clientSecret);

  if (!verifyToken || !timingSafeEqual(verifyToken, expected)) {
    return Response.json(
      { error: "invalid verify token" },
      { status: 403, headers: NO_STORE },
    );
  }

  return Response.json(
    { "hub.challenge": challenge },
    { status: 200, headers: NO_STORE },
  );
}

export async function POST(request: Request) {
  // Events are acknowledged and discarded: there is no server-side store to update, and
  // Strava does not sign payloads, so an event must never be treated as authority.
  const declaredLength = Number(request.headers.get("content-length") ?? "0");

  if (declaredLength > MAX_EVENT_BYTES) {
    return new Response(null, { status: 413, headers: NO_STORE });
  }

  const body = await request.text();

  if (body.length > MAX_EVENT_BYTES) {
    return new Response(null, { status: 413, headers: NO_STORE });
  }

  return new Response(null, { status: 200, headers: NO_STORE });
}

// @vitest-environment node

import { afterEach, describe, expect, test, vi } from "vitest";

import {
  deriveVerifyToken,
  ensureWebhookSubscription,
} from "@/lib/strava/webhook";

const config = {
  clientId: "1234",
  clientSecret: "secret",
  publicOrigin: "https://sports-map.test",
};

function mockFetch(handler: (url: string, init?: RequestInit) => Response) {
  const calls: { url: string; init?: RequestInit }[] = [];

  const spy = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return handler(String(url), init);
  });

  vi.stubGlobal("fetch", spy);

  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ensureWebhookSubscription", () => {
  test("does nothing when the Strava credentials are not configured", async () => {
    const calls = mockFetch(() => Response.json([]));

    expect(await ensureWebhookSubscription({})).toBe("skipped");
    expect(calls).toHaveLength(0);
  });

  test("leaves an existing subscription alone", async () => {
    const calls = mockFetch(() =>
      Response.json([{ id: 1, callback_url: "https://existing.test/webhooks" }]),
    );

    expect(await ensureWebhookSubscription(config)).toBe("exists");

    // Only the lookup — never a create that could replace someone else's subscription.
    expect(calls).toHaveLength(1);
    expect(calls[0].init?.method).toBeUndefined();
  });

  test("creates the subscription with a token derived from the secret", async () => {
    const calls = mockFetch((url) =>
      url.includes("?") ? Response.json([]) : Response.json({ id: 2 }, { status: 201 }),
    );

    expect(await ensureWebhookSubscription(config)).toBe("created");

    const create = calls[1];
    const body = new URLSearchParams(String(create.init?.body));

    expect(body.get("callback_url")).toBe("https://sports-map.test/webhooks");
    expect(body.get("verify_token")).toBe(await deriveVerifyToken("secret"));
  });

  test("treats a 409 (already registered elsewhere) as success", async () => {
    mockFetch((url) =>
      url.includes("?")
        ? Response.json([])
        : new Response("conflict", { status: 409 }),
    );

    expect(await ensureWebhookSubscription(config)).toBe("exists");
  });
});

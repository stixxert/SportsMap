// @vitest-environment node
// Server route: needs Web Crypto (subtle), which jsdom does not provide.

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { GET, POST } from "@/app/webhooks/route";
import { deriveVerifyToken } from "@/lib/strava/webhook";

const CLIENT_SECRET = "test-client-secret";

let expectedToken: string;

function verifyUrl(params: Record<string, string>) {
  return `https://sports-map.test/webhooks?${new URLSearchParams(params)}`;
}

beforeEach(async () => {
  vi.stubEnv("CLIENT_SECRET", CLIENT_SECRET);
  expectedToken = await deriveVerifyToken(CLIENT_SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("webhook verification", () => {
  test("echoes hub.challenge for a valid subscribe request", async () => {
    const response = await GET(
      new Request(
        verifyUrl({
          "hub.mode": "subscribe",
          "hub.challenge": "abc123",
          "hub.verify_token": expectedToken,
        }),
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ "hub.challenge": "abc123" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("rejects a token derived from a different secret", async () => {
    const foreign = await deriveVerifyToken("some-other-secret");

    const response = await GET(
      new Request(
        verifyUrl({
          "hub.mode": "subscribe",
          "hub.challenge": "abc123",
          "hub.verify_token": foreign,
        }),
      ),
    );

    expect(response.status).toBe(403);
  });

  test("rejects a request that is not a subscribe verification", async () => {
    const response = await GET(
      new Request(
        verifyUrl({
          "hub.mode": "unsubscribe",
          "hub.challenge": "abc123",
          "hub.verify_token": expectedToken,
        }),
      ),
    );

    expect(response.status).toBe(400);
  });

  test("fails closed without a client secret", async () => {
    vi.stubEnv("CLIENT_SECRET", "");

    const response = await GET(
      new Request(
        verifyUrl({
          "hub.mode": "subscribe",
          "hub.challenge": "abc123",
          "hub.verify_token": "anything",
        }),
      ),
    );

    expect(response.status).toBe(503);
  });
});

describe("webhook events", () => {
  test("acknowledges events without acting on them", async () => {
    const response = await POST(
      new Request("https://sports-map.test/webhooks", {
        method: "POST",
        body: JSON.stringify({ object_type: "activity", aspect_type: "create" }),
      }),
    );

    // Nothing is stored server-side, so there is nothing to do but accept and discard.
    expect(response.status).toBe(200);
  });

  test("rejects an oversized body", async () => {
    const response = await POST(
      new Request("https://sports-map.test/webhooks", {
        method: "POST",
        body: "x".repeat(65 * 1024),
      }),
    );

    expect(response.status).toBe(413);
  });
});

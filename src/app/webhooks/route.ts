export const dynamic = "force-static";

// Strava requires web-hooks as a part of TOS - as we don't store data on a server,
// we omit actual implementation of processing these updates.

export async function GET(request: Request) {
  const queryParams = new URL(request.cache);

  const challenge = queryParams.searchParams.get("hub.verify_token");

  if (challenge == null) {
    return Response.json({}, { status: 400 });
  }

  return Response.json({ "hub.challenge": challenge }, { status: 200 });
}

export async function POST() {
  return Response.json({}, { status: 200 });
}

import demoActivities from "demo_data/activities.json";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const page = Number(params.get("page") || "1");
  const per_page = Number(params.get("per_page") || "10");

  if (page < 1) {
    return Response.json([]);
  }

  const totalItems = demoActivities.length;

  const startIndex = (page - 1) * per_page;
  let endIndex = startIndex + per_page;

  if (startIndex + 1 < totalItems) {
    endIndex = Math.min(endIndex, totalItems);
  } else {
    return Response.json([]);
  }

  return Response.json(demoActivities.slice(startIndex, endIndex));
}

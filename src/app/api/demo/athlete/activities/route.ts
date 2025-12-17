import { NextRequest } from "next/server";
import * as fs from "node:fs";

function dateCmp(a: Date, b: Date) {
  return a.getTime() - b.getTime();
}

export async function GET(request: NextRequest) {
  const activitiesRaw = fs.readFileSync("demo_data/activities.json", "utf8");

  const demoActivities: { [key: string]: string; start_date: string }[] =
    JSON.parse(activitiesRaw);

  /* switch ordering; newest to oldest */
  demoActivities.sort((activityA, activityB) =>
    dateCmp(
      activityB.start_date ? new Date(activityB.start_date) : new Date(0),
      activityA.start_date ? new Date(activityA.start_date) : new Date(0),
    ),
  );

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

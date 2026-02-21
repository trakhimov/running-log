import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: process.env.STRAVA_REDIRECT_URI!,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  });

  const stravaAuthUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(stravaAuthUrl);
}

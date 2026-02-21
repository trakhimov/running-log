import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const info: Record<string, unknown> = {
    SESSION_SECRET_length: process.env.SESSION_SECRET?.length ?? "MISSING",
    STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID ?? "MISSING",
    STRAVA_REDIRECT_URI: process.env.STRAVA_REDIRECT_URI ?? "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    const session = await getSession();
    info.session_ok = true;
    info.has_access_token = !!session.accessToken;
  } catch (err) {
    info.session_error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(info);
}

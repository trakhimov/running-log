import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/strava/client";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=strava_denied", request.url));
  }

  try {
    const tokens = await exchangeCode(code);
    const athlete = tokens.athlete;

    if (!athlete) {
      return NextResponse.redirect(new URL("/?error=no_athlete", request.url));
    }

    const session = await getSession();
    session.stravaId = athlete.id;
    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.tokenExpiresAt = tokens.expires_at;
    session.firstName = athlete.firstname;
    session.lastName = athlete.lastname;
    session.maxHr = session.maxHr ?? 190;
    session.restingHr = session.restingHr ?? 50;
    await session.save();

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}

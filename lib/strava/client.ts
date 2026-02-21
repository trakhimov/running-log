import { IronSession } from "iron-session";
import { SessionData } from "@/lib/session";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

export interface StravaActivity {
  id: number;
  name: string;
  start_date: string;
  distance: number;
  moving_time: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  total_elevation_gain: number;
  map: {
    summary_polyline?: string;
  };
  type: string;
  sport_type: string;
  splits_metric?: StravaSplit[];
  best_efforts?: StravaBestEffort[];
  laps?: StravaLap[];
}

export interface StravaSplit {
  distance: number;
  elapsed_time: number;
  moving_time: number;
  average_speed: number;
  average_heartrate?: number;
  average_cadence?: number;
}

export interface StravaBestEffort {
  id: number;
  name: string;
  elapsed_time: number;
  distance: number;
  start_date: string;
}

export interface StravaLap {
  distance: number;
  elapsed_time: number;
  moving_time: number;
  average_speed: number;
  average_heartrate?: number;
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: StravaAthlete;
}

// Exchange auth code for tokens
export async function exchangeCode(code: string): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token exchange failed: ${res.statusText}`);
  }

  return res.json();
}

// Refresh an expired access token
export async function refreshToken(
  refreshTokenStr: string
): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshTokenStr,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.statusText}`);
  }

  return res.json();
}

// Check session token expiry and refresh if needed, then return valid access token
export async function refreshSessionIfNeeded(
  session: IronSession<SessionData>
): Promise<string> {
  if (!session.accessToken) throw new Error("Not authenticated");

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  if (session.tokenExpiresAt && session.tokenExpiresAt - now < fiveMinutes) {
    if (!session.refreshToken) throw new Error("No refresh token available");
    const tokens = await refreshToken(session.refreshToken);
    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.tokenExpiresAt = tokens.expires_at;
    await session.save();
  }

  return session.accessToken;
}

// Make an authenticated Strava API call using a pre-fetched token
export async function stravaFetch<T>(
  token: string,
  path: string,
  params?: Record<string, string | number>
): Promise<T> {
  const url = new URL(`${STRAVA_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Strava API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

// Fetch all running activities (paginated until exhausted)
export async function fetchAllActivities(
  token: string,
  after?: number
): Promise<StravaActivity[]> {
  const activities: StravaActivity[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const params: Record<string, string | number> = {
      per_page: perPage,
      page,
    };
    if (after) params.after = after;

    const batch = await stravaFetch<StravaActivity[]>(
      token,
      "/athlete/activities",
      params
    );

    const runs = batch.filter(
      (a) =>
        a.sport_type === "Run" ||
        a.type === "Run" ||
        a.sport_type === "TrailRun" ||
        a.sport_type === "VirtualRun"
    );

    activities.push(...runs);

    if (batch.length < perPage) break;
    page++;
  }

  return activities;
}

// Fetch detailed activity with splits + best efforts
export async function fetchActivityDetail(
  token: string,
  stravaActivityId: number
): Promise<StravaActivity> {
  return stravaFetch<StravaActivity>(token, `/activities/${stravaActivityId}`);
}

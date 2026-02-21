import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session.accessToken) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo / Hero */}
        <div className="text-center mb-12">
          <div className="neu-raised w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🏃</span>
          </div>
          <h1 className="text-3xl font-bold text-neu-text mb-2">Running Log</h1>
          <p className="text-neu-text-muted text-sm leading-relaxed">
            Deep fitness analytics for your runs. Cardiac efficiency, TRIMP load,
            VDOT — metrics Strava doesn&apos;t show you.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-10">
          {[
            { icon: "❤️", text: "Cardiac efficiency trend over time" },
            { icon: "📊", text: "Weekly training load (TRIMP)" },
            { icon: "⚡", text: "VDOT & race predictions" },
            { icon: "🗺️", text: "Route heatmap from all your runs" },
            { icon: "🏆", text: "Personal records dashboard" },
          ].map((f) => (
            <div key={f.text} className="neu-raised rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm text-neu-text">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="neu-inset rounded-xl px-4 py-2 mb-4 text-red-500 text-sm text-center">
            {error === "strava_denied"
              ? "Strava connection was cancelled."
              : "Connection failed. Please try again."}
          </div>
        )}

        {/* CTA */}
        <a href="/api/auth/strava" className="block">
          <button className="w-full neu-raised rounded-2xl py-4 flex items-center justify-center gap-3 text-neu-text font-semibold text-base active:neu-inset transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" fill="#FC4C02" />
            </svg>
            Connect with Strava
          </button>
        </a>

        <p className="text-center text-xs text-neu-text-muted mt-4">
          Read-only access to your Strava activities.
        </p>
      </div>
    </main>
  );
}

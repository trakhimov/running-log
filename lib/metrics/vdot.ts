/**
 * VDOT calculation using Jack Daniels' formula.
 * v = speed in m/min
 * t = time in minutes
 *
 * VDOT = (-4.6 + 0.182258v + 0.000104v²) / (0.8 + 0.1894393e^(-0.012778t) + 0.2989558e^(-0.1932605t))
 */
export function computeVDOT(
  distanceMeters: number,
  elapsedTimeSeconds: number
): number {
  const t = elapsedTimeSeconds / 60; // time in minutes
  const v = distanceMeters / t; // speed in m/min

  const numerator = -4.6 + 0.182258 * v + 0.000104 * v * v;
  const denominator =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * t) +
    0.2989558 * Math.exp(-0.1932605 * t);

  return numerator / denominator;
}

// Get the best VDOT from an array of best efforts
export function bestVDOTFromEfforts(
  efforts: Array<{ distance: number; elapsedTime: number }>
): number | null {
  if (!efforts.length) return null;

  const vdots = efforts
    .filter((e) => e.distance >= 1000) // at least 1k
    .map((e) => computeVDOT(e.distance, e.elapsedTime));

  if (!vdots.length) return null;
  return Math.max(...vdots);
}

// Estimate equivalent race time for a given distance from VDOT
export function predictRaceTime(vdot: number, distanceMeters: number): number {
  // Binary search for the time that produces the given VDOT
  let lo = distanceMeters / 20; // unrealistically fast
  let hi = distanceMeters / 1; // 1 m/min (walking pace)

  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const v = computeVDOT(distanceMeters, mid * 60);
    if (v > vdot) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return ((lo + hi) / 2) * 60; // return in seconds
}

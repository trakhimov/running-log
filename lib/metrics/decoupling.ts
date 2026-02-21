/**
 * Aerobic Decoupling (Pace:HR Decoupling)
 * Split activity at 50% distance mark using splits.
 * PD = ((second_half_pace / first_half_pace) - 1) * 100%
 * Only meaningful on runs > 8km.
 * Positive = decoupling (HR drifting up or pace slowing) = less aerobic fitness
 */

interface Split {
  distance?: number; // meters
  movingTime?: number; // seconds
  averageSpeed?: number; // m/s
  averageHeartrate?: number;
}

export function computePaceDecoupling(
  splits: Split[] | null | undefined,
  totalDistanceMeters: number | null
): number | null {
  if (!splits || splits.length < 4) return null;
  if (!totalDistanceMeters || totalDistanceMeters < 8000) return null;

  const halfDist = totalDistanceMeters / 2;
  let accumulated = 0;
  let splitPoint = -1;

  for (let i = 0; i < splits.length; i++) {
    accumulated += splits[i].distance ?? 1000;
    if (accumulated >= halfDist) {
      splitPoint = i;
      break;
    }
  }

  if (splitPoint <= 0 || splitPoint >= splits.length - 1) return null;

  const firstHalf = splits.slice(0, splitPoint + 1);
  const secondHalf = splits.slice(splitPoint + 1);

  const avgPace = (halvedSplits: Split[]): number | null => {
    const validSplits = halvedSplits.filter(
      (s) => s.averageSpeed && s.averageSpeed > 0
    );
    if (!validSplits.length) return null;
    const avgSpeed =
      validSplits.reduce((sum, s) => sum + (s.averageSpeed ?? 0), 0) /
      validSplits.length;
    return avgSpeed > 0 ? 1 / avgSpeed : null; // seconds per meter
  };

  const firstPace = avgPace(firstHalf);
  const secondPace = avgPace(secondHalf);

  if (!firstPace || !secondPace || firstPace === 0) return null;

  return ((secondPace / firstPace - 1) * 100);
}

export function decouplingLabel(pd: number | null): string {
  if (pd === null) return "N/A";
  if (pd < 0) return `${Math.abs(pd).toFixed(1)}% negative drift`;
  if (pd < 5) return `${pd.toFixed(1)}% (good)`;
  if (pd < 10) return `${pd.toFixed(1)}% (moderate)`;
  return `${pd.toFixed(1)}% (high)`;
}

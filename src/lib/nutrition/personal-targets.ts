/**
 * Personalized daily targets (#6) — Mifflin-St Jeor BMR × activity, goal-
 * adjusted, with protein scaled to body weight. Replaces the one-size FDA
 * 2000 kcal when the user fills their profile; everything stays an EDUCATIONAL
 * estimate (the UI carries the hedge), never a prescription.
 *
 * References: Mifflin et al. 1990 (BMR); ACSM/ISSN ranges for protein
 * (1.2–1.6 g/kg general health bracket → we use 1.4 g/kg cut/maintain,
 * 1.6 g/kg gain); fat floor 25% of energy; carbs = remainder.
 */

export interface PersonalProfile {
  sex: "female" | "male";
  age: number; // years
  heightCm: number;
  weightKg: number;
  activity: "sedentary" | "light" | "moderate" | "active";
  goal: "lose" | "maintain" | "gain";
}

export interface PersonalTargets {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

const ACTIVITY_FACTOR: Record<PersonalProfile["activity"], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const GOAL_DELTA: Record<PersonalProfile["goal"], number> = {
  lose: -400,
  maintain: 0,
  gain: 300,
};

/** Pure: profile → daily targets. Returns null for out-of-range inputs so a
 *  half-filled profile can never produce a nonsense target. */
export function computePersonalTargets(
  p: PersonalProfile,
): PersonalTargets | null {
  if (
    !Number.isFinite(p.age) ||
    p.age < 13 ||
    p.age > 100 ||
    !Number.isFinite(p.heightCm) ||
    p.heightCm < 120 ||
    p.heightCm > 230 ||
    !Number.isFinite(p.weightKg) ||
    p.weightKg < 35 ||
    p.weightKg > 250
  ) {
    return null;
  }
  const bmr =
    10 * p.weightKg +
    6.25 * p.heightCm -
    5 * p.age +
    (p.sex === "male" ? 5 : -161);
  const tdee = bmr * ACTIVITY_FACTOR[p.activity];
  // Never below a safe floor, even on "lose".
  const kcal = Math.max(1200, Math.round(tdee + GOAL_DELTA[p.goal]));
  const protein_g = Math.round(p.weightKg * (p.goal === "gain" ? 1.6 : 1.4));
  const fat_g = Math.round((kcal * 0.25) / 9);
  const carbs_g = Math.max(
    0,
    Math.round((kcal - protein_g * 4 - fat_g * 9) / 4),
  );
  return { kcal, protein_g, carbs_g, fat_g };
}

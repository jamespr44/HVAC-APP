// ─── PROJECT-LEVEL DESIGN DATA ──────────────────────────────────────────────
// These are project-level assumptions that feed into every zone calculation.
// Values below are Sydney defaults — the app should allow per-project overrides.

export const DESIGN_DATA = {
  // Climate conditions — Sydney example
  summer: { db: 37, wb: 25, mc_g_kg: 15.04, rh: 0.38 },
  winter: { db: 6, wb: 4.52, mc_g_kg: 4.63, rh: 0.80 },

  // Indoor design conditions
  indoor_summer_db: 23, // °C
  indoor_winter_db: 21, // °C

  // Air properties (at altitude correction)
  sensible_heat_factor: 1.213, // W/(L/s·K) — used everywhere for SA/OA sensible load
  latent_heat_factor: 2.9, // W/(L/s·(g/kg)) — used for latent load

  // Occupancy
  occ_sensible_w_per_person: 70,
  occ_latent_w_per_person: 60,
  oa_general_l_s_per_person: 7.5, // L/s/person (AS 1668.2 general)
  oa_green_l_s_per_person: 11.25, // L/s/person (green star / NABERS)

  // Equipment load defaults by space type (W/m²)
  equipment_loads: {
    general_lab: 40,
    wet_lab: 60,
    write_up_office: 15,
    gmp: 50,
    l2d: 60,
    ante_circulation: 10,
    atrium: 5,
  } as Record<string, number>,

  lighting_w_m2: 6, // default

  // Altitude / atmospheric
  altitude_m: 6,
  atmospheric_pressure_kpa: 101.3,
};

// ─── OCCUPANT SENSIBLE GAIN — TEMPERATURE-DEPENDENT ────────────────────────
// From Design Data sheet — interpolate between these values
export const OCC_SENSIBLE_BY_TEMP = [
  { temp: 28, sensible: 50, latent: 80 },
  { temp: 27, sensible: 55, latent: 75 },
  { temp: 26, sensible: 60, latent: 70 },
  { temp: 25, sensible: 65, latent: 65 },
  { temp: 24.5, sensible: 67.5, latent: 62.5 },
  { temp: 24.4, sensible: 67.5, latent: 62.5 },
  { temp: 24, sensible: 70, latent: 60 },
  { temp: 23.5, sensible: 71.75, latent: 58.25 },
  { temp: 23, sensible: 74, latent: 56 },
  { temp: 22, sensible: 78, latent: 52 },
  { temp: 21, sensible: 82, latent: 48 },
  { temp: 20, sensible: 86, latent: 44 },
  { temp: 19, sensible: 90, latent: 40 },
  { temp: 18, sensible: 96, latent: 36 },
];

export function getOccupantLoads(roomTempC: number): { sensible: number; latent: number } {
  // Find two nearest points and linearly interpolate
  const sorted = [...OCC_SENSIBLE_BY_TEMP].sort(
    (a, b) => Math.abs(a.temp - roomTempC) - Math.abs(b.temp - roomTempC)
  );
  // If exact match or very close, return nearest
  if (Math.abs(sorted[0].temp - roomTempC) < 0.01) {
    return { sensible: sorted[0].sensible, latent: sorted[0].latent };
  }
  // Linear interpolation between the two nearest
  const p1 = sorted[0];
  const p2 = sorted[1];
  if (p1.temp === p2.temp) return { sensible: p1.sensible, latent: p1.latent };
  const t = (roomTempC - p1.temp) / (p2.temp - p1.temp);
  return {
    sensible: p1.sensible + t * (p2.sensible - p1.sensible),
    latent: p1.latent + t * (p2.latent - p1.latent),
  };
}

// ─── FACADE TYPES (building-specific glazing systems) ──────────────────────
export const FACADE_TYPES: Record<string, { u_value: number; shgc: number }> = {
  FT01: { u_value: 3.23, shgc: 0.197 }, // Standard double glaze
  FT02: { u_value: 2.20, shgc: 0.240 }, // Performance double glaze
  FT04: { u_value: 2.33, shgc: 0.220 }, // With overhang (shaded)
};

// ─── WALL U-VALUES ─────────────────────────────────────────────────────────
export const WALL_U_VALUES = {
  standard: 1.0, // W/m²K internal partition / external wall
  roof_top: 0.238, // W/m²K (roof L8)
  roof_other: 0.27, // W/m²K (roof other levels)
};

// ─── HAP SOLAR + TRANSMISSION LOADS (W/m² of glass / wall) ────────────────
// HAP-derived facade loads — W/m² of glass area (summer cooling)
// These are project-specific — they depend on building latitude, glazing spec, and shading.
export const HAP_SUMMER_LOADS: Record<string, Record<string, { glass: number; wall: number }> | null> = {
  N: { FT01: { glass: 103, wall: 19 }, FT02: { glass: 109, wall: 19 }, FT04: { glass: 66, wall: 19 } },
  E: { FT01: { glass: 84, wall: 17 }, FT02: { glass: 92, wall: 17 } },
  S: { FT01: { glass: 64, wall: 13 }, FT02: { glass: 59, wall: 13 } },
  W: { FT01: { glass: 106, wall: 20 }, FT02: { glass: 111, wall: 20 } },
  WS: { FT01: { glass: 71.7, wall: 20 }, FT02: { glass: 93.6, wall: 20 } },
  S_SHD: { FT01: { glass: 57, wall: 13 }, FT02: { glass: 49, wall: 13 } },
  Partition: null, // internal — no solar, wall load = (37 - room_T) * wall_area * U_wall
};

// HAP winter transmission loads W/m² of glass/wall
export const HAP_WINTER_LOADS: Record<string, Record<string, { glass: number; wall: number }>> = {
  N: { FT01: { glass: 48, wall: 15 }, FT02: { glass: 33, wall: 15 } },
  E: { FT01: { glass: 48, wall: 15 }, FT02: { glass: 33, wall: 15 } },
  S: { FT01: { glass: 48, wall: 15 }, FT02: { glass: 33, wall: 15 } },
  W: { FT01: { glass: 48, wall: 15 }, FT02: { glass: 33, wall: 15 } },
};

// ─── VAV BOX SIZING TABLE ──────────────────────────────────────────────────
export const VAV_SIZES = [
  { size: 2, maxLs: 85, minLs: 25 },
  { size: 3, maxLs: 128, minLs: 38 },
  { size: 4, maxLs: 170, minLs: 50 },
  { size: 5, maxLs: 255, minLs: 75 },
  { size: 6, maxLs: 340, minLs: 100 },
  { size: 8, maxLs: 510, minLs: 150 },
  { size: 10, maxLs: 680, minLs: 200 },
  { size: 12, maxLs: 850, minLs: 250 },
  { size: 14, maxLs: 1020, minLs: 300 },
  { size: 16, maxLs: 1190, minLs: 350 },
  { size: 18, maxLs: 1360, minLs: 400 },
  { size: 20, maxLs: 1530, minLs: 450 },
];

export function selectVAV(saFinalLs: number): (typeof VAV_SIZES)[0] | null {
  return VAV_SIZES.find((v) => v.maxLs >= saFinalLs) ?? null;
}

import {
  DESIGN_DATA,
  getOccupantLoads,
  WALL_U_VALUES,
  HAP_SUMMER_LOADS,
  HAP_WINTER_LOADS,
} from './designData';

// ─── SENSIBLE HEAT FACTOR ──────────────────────────────────────────────────
// 1.213 W/(L/s·K) — air density × specific heat at Sydney altitude
// (1.206 kg/m³ × 1.005 kJ/kg·K ≈ 1.213). Non-negotiable.
const SHF = DESIGN_DATA.sensible_heat_factor; // 1.213

// ─── INTERFACES ────────────────────────────────────────────────────────────

export interface ClimateInputs {
  summerDbC: number;
  summerWbC: number;
  winterDbC: number;
  dailyRangeC: number;
  altitudeM: number;
}

export interface ZoneInputs {
  // Room identity
  roomDesc: string;
  roomCode: string;
  ahuTag: string;
  subZoneTag: string;

  // Room data
  areaM2: number;
  heightM: number;
  winterRoomTempC: number;
  summerRoomTempC: number;

  // Facade
  facadeOrientation: string; // N | E | S | W | WS | S_SHD | Partition | Internal
  facadeType: string; // FT01 | FT02 | FT04 | Partition | none
  facadeWidthM: number;
  windowWidthM: number;
  windowHeightM: number;
  hasRoof: boolean;
  exposedRoofAreaM2: number;
  roofType: string; // roof_top | roof_other

  // Occupancy
  occupants: number;
  oaMethod: 'general' | 'green' | 'custom';
  customOaLsPerPerson?: number;

  // Internal loads
  lightingWm2: number;
  equipmentWm2: number;
  equipmentPointLoadW?: number;

  // Infiltration
  infiltrationLs: number;

  // System
  saTemperatureC: number; // engineer-selected off-coil SA temp
  achRequiredSupply: number;
  achRequiredOA: number;
  isHWCReheatZone: boolean;
}

export interface ZoneResults {
  // Cooling loads
  glassSolarW: number;
  wallTransmissionW: number;
  roofTransmissionW: number;
  totalFacadeW: number;
  peopleSensibleW: number;
  peopleLatentW: number;
  lightingW: number;
  equipmentW: number;
  infiltrationW: number;
  totalSensibleW: number;

  // Supply air
  saForLoadLs: number;
  oaForOccupancyLs: number;
  saAchCalculated: number;
  oaAchCalculated: number;
  saAchRequired: number;
  saFinalLs: number;
  oaFinalLs: number;
  oaPctOfSA: number;

  // SA-T check
  saTempRequired: number;
  roomTempIfSaTRemains: number;

  // Latent
  latentWPerLs: number;

  // Heating loads (winter — transmission only)
  heatingGlassW: number;
  heatingFacadeW: number;
  heatingRoofW: number;
  heatingTotalW: number;

  // For AHU system summary
  heatingRequiredSATempC: number;

  // Derived totals for backwards compat
  totalCoolingW: number;
  totalHeatingW: number;
  supplyLs: number;
  oaLs: number;
  supplyTempC: number;
  wPerM2: number;
}

// ─── ZONE CALCULATION ENGINE ───────────────────────────────────────────────

export function calculateZoneLoads(zone: ZoneInputs, climate: ClimateInputs): ZoneResults {
  // Use project climate data, falling back to DESIGN_DATA defaults
  const summerDb = climate.summerDbC || DESIGN_DATA.summer.db;
  const winterDb = climate.winterDbC || DESIGN_DATA.winter.db;

  // ── FACADE AREA ──────────────────────────────────────────────────────────
  const ceilHeightM = zone.heightM;
  const totalFacadeAreaM2 = zone.facadeWidthM * ceilHeightM;
  const windowAreaM2 = zone.windowWidthM * zone.windowHeightM;
  const solidWallAreaM2 = Math.max(0, totalFacadeAreaM2 - windowAreaM2);

  // ── COOLING LOADS ────────────────────────────────────────────────────────

  // 1. Glass solar + transmission (W) using HAP lookup
  let glassSolarW = 0;
  let wallTransmissionW = 0;

  if (zone.facadeOrientation === 'Partition') {
    // Partition: use (summer_db - room_T) * totalFacadeArea * wallU — no solar
    wallTransmissionW =
      (summerDb - zone.summerRoomTempC) * totalFacadeAreaM2 * WALL_U_VALUES.standard;
  } else if (zone.facadeOrientation !== 'Internal') {
    const orientationLoads = HAP_SUMMER_LOADS[zone.facadeOrientation];
    if (orientationLoads) {
      const hapLoads = orientationLoads[zone.facadeType];
      if (hapLoads) {
        glassSolarW = windowAreaM2 * hapLoads.glass;
        wallTransmissionW = solidWallAreaM2 * hapLoads.wall;
      }
    }
  }

  // 2. Roof transmission
  const roofWm2 = 3; // approximate roof W/m² — or use HAP value
  const roofTransmissionW = zone.hasRoof ? roofWm2 * zone.exposedRoofAreaM2 : 0;
  const totalFacadeW = glassSolarW + wallTransmissionW + roofTransmissionW;

  // 3. People load (temperature-indexed)
  const occLoads = getOccupantLoads(zone.summerRoomTempC);
  const peopleSensibleW = occLoads.sensible * zone.occupants;
  const peopleLatentW = occLoads.latent * zone.occupants;

  // 4. Lighting
  const lightingW = zone.lightingWm2 * zone.areaM2;

  // 5. Equipment — max of point load or W/m² × area
  const equipmentW = Math.max(zone.equipmentPointLoadW ?? 0, zone.equipmentWm2 * zone.areaM2);

  // 6. Infiltration sensible load
  // (outdoor_DB - room_T) × SHF × infiltration_L/s
  const infiltrationW = (summerDb - zone.summerRoomTempC) * SHF * zone.infiltrationLs;

  const totalSensibleW = totalFacadeW + peopleSensibleW + lightingW + equipmentW + infiltrationW;

  // ── SUPPLY AIR ───────────────────────────────────────────────────────────

  // SA for load: Q_s / (SHF × ΔT)
  const deltaTSupply = zone.summerRoomTempC - zone.saTemperatureC;
  const saForLoadLs = deltaTSupply > 0 ? totalSensibleW / (SHF * deltaTSupply) : 0;

  // OA for occupancy
  const oaLsPerPerson =
    zone.oaMethod === 'green'
      ? DESIGN_DATA.oa_green_l_s_per_person
      : zone.oaMethod === 'custom'
        ? (zone.customOaLsPerPerson ?? DESIGN_DATA.oa_general_l_s_per_person)
        : DESIGN_DATA.oa_general_l_s_per_person;
  const oaForOccupancyLs = oaLsPerPerson * zone.occupants;

  // ACH-based SA
  const volumeM3 = zone.areaM2 * ceilHeightM;
  const saFromAchLs = zone.achRequiredSupply > 0 ? (zone.achRequiredSupply * volumeM3) / 3.6 : 0;
  const oaFromAchLs = zone.achRequiredOA > 0 ? (zone.achRequiredOA * volumeM3) / 3.6 : 0;

  // SA: max of load-based and ACH-based
  const saFromAchOrLoad = Math.max(saForLoadLs, saFromAchLs);

  // Final SA — CEILING.MATH to nearest 5 L/s
  const saFinalLs = Math.ceil(Math.max(saFromAchOrLoad, saFromAchLs) / 5) * 5;
  const oaFinalLs = Math.max(oaForOccupancyLs, oaFromAchLs);
  const oaPctOfSA = saFinalLs > 0 ? oaFinalLs / saFinalLs : 0;

  // ACH values
  const saAchCalculated = volumeM3 > 0 ? (saForLoadLs / volumeM3) * 3.6 : 0;
  const oaAchCalculated = volumeM3 > 0 ? (oaForOccupancyLs / volumeM3) * 3.6 : 0;

  // SA-T check
  const saTempRequired =
    saFinalLs > 0
      ? zone.summerRoomTempC - totalSensibleW / (SHF * saFinalLs)
      : zone.saTemperatureC;
  const roomTempIfSaTRemains =
    saFinalLs > 0
      ? totalSensibleW / (SHF * saFinalLs) + zone.saTemperatureC
      : zone.summerRoomTempC;

  // Latent load per L/s (for dehumidification check at AHU)
  const latentWPerLs = saFinalLs > 0 ? peopleLatentW / saFinalLs : 0;

  // ── HEATING LOADS (winter) ───────────────────────────────────────────────
  // Transmission only — no solar, winter design conditions
  let heatingGlassW = 0;
  let heatingFacadeW = 0;
  let heatingRoofW = 0;

  if (zone.facadeOrientation === 'Partition') {
    heatingFacadeW =
      (zone.winterRoomTempC - winterDb) * totalFacadeAreaM2 * WALL_U_VALUES.standard;
  } else if (zone.facadeOrientation !== 'Internal') {
    const hapWinterLoads = HAP_WINTER_LOADS[zone.facadeOrientation]?.[zone.facadeType];
    if (hapWinterLoads) {
      heatingGlassW = windowAreaM2 * hapWinterLoads.glass;
      heatingFacadeW = solidWallAreaM2 * hapWinterLoads.wall;
    }
  }
  // Roof heating: approximate based on temp diff ratio
  const summerTempDiff = summerDb - zone.summerRoomTempC;
  heatingRoofW =
    zone.hasRoof && summerTempDiff > 0
      ? roofWm2 * zone.exposedRoofAreaM2 * ((zone.winterRoomTempC - winterDb) / summerTempDiff)
      : 0;
  const heatingTotalW = heatingGlassW + heatingFacadeW + heatingRoofW;

  // Heating SA temp required
  // For HWC zones: SA-T = room_T (reheated air supplied at room temp)
  // For others: SA-T = room_T + heating / (SHF × SA_final)
  const heatingRequiredSATempC = zone.isHWCReheatZone
    ? zone.winterRoomTempC
    : saFinalLs > 0
      ? zone.winterRoomTempC + heatingTotalW / (SHF * saFinalLs)
      : zone.winterRoomTempC;

  return {
    glassSolarW,
    wallTransmissionW,
    roofTransmissionW,
    totalFacadeW,
    peopleSensibleW,
    peopleLatentW,
    lightingW,
    equipmentW,
    infiltrationW,
    totalSensibleW,
    saForLoadLs,
    oaForOccupancyLs,
    saAchCalculated,
    oaAchCalculated,
    saAchRequired: zone.achRequiredSupply,
    saFinalLs,
    oaFinalLs,
    oaPctOfSA,
    saTempRequired,
    roomTempIfSaTRemains,
    latentWPerLs,
    heatingGlassW,
    heatingFacadeW,
    heatingRoofW,
    heatingTotalW,
    heatingRequiredSATempC,
    // Derived totals for route/DB compat
    totalCoolingW: totalSensibleW + peopleLatentW,
    totalHeatingW: heatingTotalW,
    supplyLs: saFinalLs,
    oaLs: Math.ceil(oaFinalLs),
    supplyTempC: zone.saTemperatureC,
    wPerM2: zone.areaM2 > 0 ? Math.round(totalSensibleW / zone.areaM2) : 0,
  };
}

// ─── ZONING CHECK ──────────────────────────────────────────────────────────
// For VAV systems, check whether a single AHU supply temp works across all zones.

export interface ZoningCheckResult {
  maxRoomTemp: number;
  minRoomTemp: number;
  tempRange: number;
  status: 'Good' | 'Warning' | 'Poor';
  reheatRequired: boolean;
}

export function checkZoning(
  zonesInGroup: ZoneResults[],
  saTempC: number
): ZoningCheckResult {
  const roomTemps = zonesInGroup.map(
    (z) => z.totalSensibleW / (SHF * z.saFinalLs) + saTempC
  );
  const max = Math.max(...roomTemps);
  const min = Math.min(...roomTemps);
  const range = max - min;
  return {
    maxRoomTemp: max,
    minRoomTemp: min,
    tempRange: range,
    status: range < 2 ? 'Good' : range < 4 ? 'Warning' : 'Poor',
    reheatRequired: min < 20,
  };
}

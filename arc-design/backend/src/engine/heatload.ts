import { psychro } from './psychro';

export interface ClimateInputs {
  summerDbC: number;
  summerWbC: number;
  winterDbC: number;
  dailyRangeC: number;
  altitudeM: number;
}

export interface ZoneInputs {
  areaM2: number;
  heightM: number;
  orientation: string;
  hasExternalWall: boolean;
  hasRoof: boolean;
  glazingPct: number;
  wallUValue: number;
  glassUValue: number;
  glassSHGC: number;
  roofUValue: number;
  occupants: number;
  occupantActivity: string;
  lightingWm2: number;
  equipmentWm2: number;
  tempCoolingC: number;
  tempHeatingC: number;
  humidityMaxPct: number;
  oaMethod: 'ashrae_62' | 'ach' | 'l_s_m2' | 'custom';
  oaLsPerPerson: number;
  oaLsPerM2: number;
  achSupply?: number;
  exhaustLs?: number;
  is100PctOA: boolean;
}

export interface LoadResult {
  solarGainW: number;
  conductionCoolingW: number;
  occupantSensibleW: number;
  occupantLatentW: number;
  lightingW: number;
  equipmentW: number;
  ventilationSensibleW: number;
  ventilationLatentW: number;
  totalSensibleW: number;
  totalLatentW: number;
  totalCoolingW: number;
  totalHeatingW: number;
  supplyLs: number;
  oaLs: number;
  exhaustLs: number;
  supplyTempC: number;
  supplyRhPct: number;
  wPerM2: number;
}

const CLTD_BY_ORIENTATION: Record<string, number> = {
  N: 8, NE: 10, E: 14, SE: 12, S: 8, SW: 14, W: 16, NW: 12, Internal: 0
};
const SOLAR_FACTOR_BY_ORIENTATION: Record<string, number> = {
  N: 80, NE: 130, E: 200, SE: 180, S: 70, SW: 180, W: 200, NW: 130, Internal: 0
};
const OCCUPANT_SENSIBLE_W: Record<string, number> = {
  seated: 70, light_work: 85, standing: 100, heavy: 185
};
const OCCUPANT_LATENT_W: Record<string, number> = {
  seated: 45, light_work: 55, standing: 65, heavy: 130
};

export function calculateZoneLoads(zone: ZoneInputs, climate: ClimateInputs): LoadResult {
  const { areaM2, heightM } = zone;
  const volumeM3 = areaM2 * heightM;
  const rhoAir = 1.2;

  const perimeterM = 4 * Math.sqrt(areaM2);
  const externalWallAreaM2 = zone.hasExternalWall ? perimeterM * heightM * 0.6 : 0;
  const glassAreaM2 = externalWallAreaM2 * (zone.glazingPct / 100);
  const solidWallAreaM2 = externalWallAreaM2 - glassAreaM2;
  const roofAreaM2 = zone.hasRoof ? areaM2 : 0;

  const cltdCorrection = (climate.summerDbC - 35) + (29 - zone.tempCoolingC);
  const wallCLTD = (CLTD_BY_ORIENTATION[zone.orientation] || 8) + cltdCorrection;
  const roofCLTD = 30 + cltdCorrection;

  const solarFactor = SOLAR_FACTOR_BY_ORIENTATION[zone.orientation] || 100;
  const solarGainW = glassAreaM2 * solarFactor * zone.glassSHGC * 0.55;

  const conductionCoolingW =
    solidWallAreaM2 * zone.wallUValue * wallCLTD +
    glassAreaM2 * zone.glassUValue * wallCLTD +
    roofAreaM2 * zone.roofUValue * roofCLTD;

  const occupantSensibleW = zone.occupants * (OCCUPANT_SENSIBLE_W[zone.occupantActivity] ?? 70);
  const occupantLatentW   = zone.occupants * (OCCUPANT_LATENT_W[zone.occupantActivity] ?? 45);
  const lightingW = areaM2 * zone.lightingWm2;
  const equipmentW = areaM2 * zone.equipmentWm2;

  const oaLs = calculateOAFlow(zone, volumeM3);

  const pressureKPa = 101.325 * Math.pow(1 - 0.0000225577 * climate.altitudeM, 5.25588);
  const oaHumRatio = psychro.GetHumRatioFromTWetBulb(
    climate.summerDbC, climate.summerWbC, pressureKPa * 1000
  );
  const roomHumRatio = psychro.GetHumRatioFromRelHum(
    zone.tempCoolingC, zone.humidityMaxPct / 100, pressureKPa * 1000
  );
  const oaMassFlowKgS = (oaLs / 1000) * rhoAir;
  const deltaT = climate.summerDbC - zone.tempCoolingC;
  const ventilationSensibleW = oaMassFlowKgS * 1006 * deltaT;
  const ventilationLatentW   = oaMassFlowKgS * 2501000 * Math.max(0, oaHumRatio - roomHumRatio);

  const totalSensibleW = solarGainW + conductionCoolingW + occupantSensibleW +
                          lightingW + equipmentW + ventilationSensibleW;
  const totalLatentW   = occupantLatentW + ventilationLatentW;
  const totalCoolingW  = totalSensibleW + totalLatentW;

  const supplyTempC = 12.5;
  const deltaTSupply = zone.tempCoolingC - supplyTempC;
  const loadBasedSupplyLs = (totalSensibleW / (rhoAir * 1006 * deltaTSupply)) * 1000;
  const achBasedSupplyLs  = zone.achSupply ? (zone.achSupply * volumeM3 / 3.6) : 0;
  const supplyLs = Math.max(loadBasedSupplyLs, achBasedSupplyLs, oaLs);

  const heatingDeltaT = zone.tempHeatingC - climate.winterDbC;
  const heatingConduction =
    (solidWallAreaM2 * zone.wallUValue +
     glassAreaM2 * zone.glassUValue +
     roofAreaM2 * zone.roofUValue) * heatingDeltaT;
  const heatingVentilation = oaMassFlowKgS * 1006 * heatingDeltaT;
  const totalHeatingW = heatingConduction + heatingVentilation;

  return {
    solarGainW, conductionCoolingW, occupantSensibleW, occupantLatentW,
    lightingW, equipmentW, ventilationSensibleW, ventilationLatentW,
    totalSensibleW, totalLatentW, totalCoolingW, totalHeatingW,
    supplyLs: Math.round(supplyLs),
    oaLs: Math.round(oaLs),
    exhaustLs: Math.round(zone.exhaustLs || 0),
    supplyTempC,
    supplyRhPct: 92,
    wPerM2: Math.round(totalSensibleW / areaM2),
  };
}

function calculateOAFlow(zone: ZoneInputs, volumeM3: number): number {
  switch (zone.oaMethod) {
    case 'ashrae_62': return zone.occupants * zone.oaLsPerPerson + zone.areaM2 * zone.oaLsPerM2;
    case 'ach':       return zone.achSupply ? (zone.achSupply * volumeM3 / 3.6) : 0;
    case 'l_s_m2':    return zone.areaM2 * zone.oaLsPerM2;
    default:          return zone.occupants * zone.oaLsPerPerson;
  }
}

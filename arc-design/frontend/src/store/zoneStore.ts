import { create } from 'zustand';
import { useProjectStore } from './projectStore';

// ─── DESIGN DATA (mirrors backend designData.ts) ────────────────────────────
const DESIGN_DATA = {
  sensible_heat_factor: 1.213,
  latent_heat_factor: 2.9,
  oa_general_l_s_per_person: 7.5,
  oa_green_l_s_per_person: 11.25,
};

const OCC_SENSIBLE_BY_TEMP = [
  { temp: 28, sensible: 50, latent: 80 },
  { temp: 27, sensible: 55, latent: 75 },
  { temp: 26, sensible: 60, latent: 70 },
  { temp: 25, sensible: 65, latent: 65 },
  { temp: 24.5, sensible: 67.5, latent: 62.5 },
  { temp: 24, sensible: 70, latent: 60 },
  { temp: 23.5, sensible: 71.75, latent: 58.25 },
  { temp: 23, sensible: 74, latent: 56 },
  { temp: 22, sensible: 78, latent: 52 },
  { temp: 21, sensible: 82, latent: 48 },
  { temp: 20, sensible: 86, latent: 44 },
  { temp: 19, sensible: 90, latent: 40 },
  { temp: 18, sensible: 96, latent: 36 },
];

function getOccupantLoads(roomTempC: number) {
  const sorted = [...OCC_SENSIBLE_BY_TEMP].sort(
    (a, b) => Math.abs(a.temp - roomTempC) - Math.abs(b.temp - roomTempC)
  );
  const p1 = sorted[0];
  const p2 = sorted[1];
  if (!p2 || Math.abs(p1.temp - roomTempC) < 0.01) return { sensible: p1.sensible, latent: p1.latent };
  const t = (roomTempC - p1.temp) / (p2.temp - p1.temp);
  return {
    sensible: p1.sensible + t * (p2.sensible - p1.sensible),
    latent: p1.latent + t * (p2.latent - p1.latent),
  };
}



const WALL_U_STANDARD = 1.0;

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

export function selectVAV(saFinalLs: number) {
  return VAV_SIZES.find((v) => v.maxLs >= saFinalLs) ?? null;
}

// ─── ZONE TYPES ─────────────────────────────────────────────────────────────

export interface ZoneInputs {
  id: string;
  tag: string;
  name: string;
  floor: string;
  ahuTag: string;
  subZoneTag: string;
  areaM2: number;
  heightM: number;
  summerRoomTempC: number;
  winterRoomTempC: number;
  facadeOrientation: string;
  facadeType: string;
  facadeWidthM: number;
  windowWidthM: number;
  windowHeightM: number;
  hasRoof: boolean;
  exposedRoofAreaM2: number;
  roofType: string;
  occupants: number;
  oaMethod: 'general' | 'green' | 'custom';
  customOaLsPerPerson?: number;
  lightingWm2: number;
  equipmentWm2: number;
  equipmentPointLoadW: number;
  infiltrationLs: number;
  saTemperatureC: number;
  achRequiredSupply: number;
  achRequiredOA: number;
  isHWCReheatZone: boolean;
}

export interface ZoneResults {
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
  saForLoadLs: number;
  oaForOccupancyLs: number;
  saAchCalculated: number;
  oaAchCalculated: number;
  saFinalLs: number;
  oaFinalLs: number;
  oaPctOfSA: number;
  saTempRequired: number;
  roomTempIfSaTRemains: number;
  latentWPerLs: number;
  heatingGlassW: number;
  heatingFacadeW: number;
  heatingRoofW: number;
  heatingTotalW: number;
  heatingRequiredSATempC: number;
}

// ─── ENGINE (client-side mirror of backend heatload.ts) ─────────────────────

export function calculateZone(zone: ZoneInputs): ZoneResults {
  const projectStore = useProjectStore.getState();
  const info = projectStore.info;
  const SHF = DESIGN_DATA.sensible_heat_factor;
  const summerDb = info.summerDbC;
  const winterDb = info.winterDbC;

  const totalFacadeAreaM2 = zone.facadeWidthM * zone.heightM;
  const windowAreaM2 = zone.windowWidthM * zone.windowHeightM;
  const solidWallAreaM2 = Math.max(0, totalFacadeAreaM2 - windowAreaM2);

  let glassSolarW = 0;
  let wallTransmissionW = 0;

  if (zone.facadeOrientation === 'Partition') {
    wallTransmissionW = (summerDb - zone.summerRoomTempC) * totalFacadeAreaM2 * WALL_U_STANDARD;
  } else if (zone.facadeOrientation !== 'Internal') {
    const ft = projectStore.customFacadeTypes.find(f => f.id === zone.facadeType);
    if (ft) {
      const hapLoads = (ft.hapLoads as any)[zone.facadeOrientation];
      if (hapLoads) {
        glassSolarW = windowAreaM2 * hapLoads.glass;
        wallTransmissionW = solidWallAreaM2 * hapLoads.wall;
      }
    }
  }

  const roofWm2 = 3;
  const roofTransmissionW = zone.hasRoof ? roofWm2 * zone.exposedRoofAreaM2 : 0;
  const totalFacadeW = glassSolarW + wallTransmissionW + roofTransmissionW;

  const occLoads = getOccupantLoads(zone.summerRoomTempC);
  const peopleSensibleW = occLoads.sensible * zone.occupants;
  const peopleLatentW = occLoads.latent * zone.occupants;

  const lightingW = zone.lightingWm2 * zone.areaM2;
  const equipmentW = Math.max(zone.equipmentPointLoadW, zone.equipmentWm2 * zone.areaM2);
  const infiltrationW = (summerDb - zone.summerRoomTempC) * SHF * zone.infiltrationLs;
  const totalSensibleW = totalFacadeW + peopleSensibleW + lightingW + equipmentW + infiltrationW;

  const deltaTSupply = zone.summerRoomTempC - zone.saTemperatureC;
  const saForLoadLs = deltaTSupply > 0 ? totalSensibleW / (SHF * deltaTSupply) : 0;

  const oaLsPerPerson =
    zone.oaMethod === 'green'
      ? DESIGN_DATA.oa_green_l_s_per_person
      : zone.oaMethod === 'custom'
      ? (zone.customOaLsPerPerson ?? DESIGN_DATA.oa_general_l_s_per_person)
      : DESIGN_DATA.oa_general_l_s_per_person;
  const oaForOccupancyLs = oaLsPerPerson * zone.occupants;

  const volumeM3 = zone.areaM2 * zone.heightM;
  const saFromAchLs = zone.achRequiredSupply > 0 ? (zone.achRequiredSupply * volumeM3) / 3.6 : 0;
  const oaFromAchLs = zone.achRequiredOA > 0 ? (zone.achRequiredOA * volumeM3) / 3.6 : 0;

  const saFromAchOrLoad = Math.max(saForLoadLs, saFromAchLs);
  const saFinalLs = Math.ceil(saFromAchOrLoad / 5) * 5 || 5;
  const oaFinalLs = Math.max(oaForOccupancyLs, oaFromAchLs);
  const oaPctOfSA = saFinalLs > 0 ? oaFinalLs / saFinalLs : 0;

  const saAchCalculated = volumeM3 > 0 ? (saForLoadLs / volumeM3) * 3.6 : 0;
  const oaAchCalculated = volumeM3 > 0 ? (oaForOccupancyLs / volumeM3) * 3.6 : 0;

  const saTempRequired =
    saFinalLs > 0 ? zone.summerRoomTempC - totalSensibleW / (SHF * saFinalLs) : zone.saTemperatureC;
  const roomTempIfSaTRemains =
    saFinalLs > 0 ? totalSensibleW / (SHF * saFinalLs) + zone.saTemperatureC : zone.summerRoomTempC;

  const latentWPerLs = saFinalLs > 0 ? peopleLatentW / saFinalLs : 0;

  let heatingGlassW = 0;
  let heatingFacadeW = 0;
  let heatingRoofW = 0;

  if (zone.facadeOrientation === 'Partition') {
    heatingFacadeW = (zone.winterRoomTempC - winterDb) * totalFacadeAreaM2 * WALL_U_STANDARD;
  } else if (zone.facadeOrientation !== 'Internal') {
    const ft = projectStore.customFacadeTypes.find(f => f.id === zone.facadeType);
    if (ft) {
      const hapWinterLoads = (ft.winterLoads as any)[zone.facadeOrientation];
      if (hapWinterLoads) {
        heatingGlassW = windowAreaM2 * hapWinterLoads.glass;
        heatingFacadeW = solidWallAreaM2 * hapWinterLoads.wall;
      }
    }
  }
  const summerTempDiff = summerDb - zone.summerRoomTempC;
  heatingRoofW =
    zone.hasRoof && summerTempDiff > 0
      ? roofWm2 * zone.exposedRoofAreaM2 * ((zone.winterRoomTempC - winterDb) / summerTempDiff)
      : 0;

  const heatingTotalW = heatingGlassW + heatingFacadeW + heatingRoofW;
  const heatingRequiredSATempC = zone.isHWCReheatZone
    ? zone.winterRoomTempC
    : saFinalLs > 0
    ? zone.winterRoomTempC + heatingTotalW / (SHF * saFinalLs)
    : zone.winterRoomTempC;

  return {
    glassSolarW, wallTransmissionW, roofTransmissionW, totalFacadeW,
    peopleSensibleW, peopleLatentW, lightingW, equipmentW, infiltrationW, totalSensibleW,
    saForLoadLs, oaForOccupancyLs, saAchCalculated, oaAchCalculated,
    saFinalLs, oaFinalLs, oaPctOfSA,
    saTempRequired, roomTempIfSaTRemains, latentWPerLs,
    heatingGlassW, heatingFacadeW, heatingRoofW, heatingTotalW, heatingRequiredSATempC,
  };
}

// ─── STORE ───────────────────────────────────────────────────────────────────

interface ZoneRecord {
  inputs: ZoneInputs;
  results: ZoneResults;
}

const DEFAULT_ZONES: ZoneInputs[] = [
  { id: '1', tag: 'L1-01', name: 'Open Plan Office', floor: 'Level 1', ahuTag: 'AHU-01', subZoneTag: 'HWC-L01-01', areaM2: 240, heightM: 3.0, summerRoomTempC: 23, winterRoomTempC: 21, facadeOrientation: 'N', facadeType: 'FT01', facadeWidthM: 20, windowWidthM: 16, windowHeightM: 2.4, hasRoof: false, exposedRoofAreaM2: 0, roofType: 'roof_other', occupants: 48, oaMethod: 'general', lightingWm2: 6, equipmentWm2: 15, equipmentPointLoadW: 0, infiltrationLs: 0, saTemperatureC: 12, achRequiredSupply: 0, achRequiredOA: 0, isHWCReheatZone: true },
  { id: '2', tag: 'L1-02', name: 'Meeting Room A', floor: 'Level 1', ahuTag: 'AHU-01', subZoneTag: 'HWC-L01-02', areaM2: 25, heightM: 3.0, summerRoomTempC: 23, winterRoomTempC: 21, facadeOrientation: 'E', facadeType: 'FT02', facadeWidthM: 5, windowWidthM: 3, windowHeightM: 2.4, hasRoof: false, exposedRoofAreaM2: 0, roofType: 'roof_other', occupants: 8, oaMethod: 'general', lightingWm2: 6, equipmentWm2: 10, equipmentPointLoadW: 350, infiltrationLs: 0, saTemperatureC: 12, achRequiredSupply: 0, achRequiredOA: 0, isHWCReheatZone: true },
  { id: '3', tag: 'L1-03', name: 'General Lab', floor: 'Level 1', ahuTag: 'AHU-01', subZoneTag: 'HWC-L01-03', areaM2: 80, heightM: 3.0, summerRoomTempC: 23, winterRoomTempC: 21, facadeOrientation: 'W', facadeType: 'FT01', facadeWidthM: 8, windowWidthM: 6, windowHeightM: 2.4, hasRoof: false, exposedRoofAreaM2: 0, roofType: 'roof_other', occupants: 8, oaMethod: 'general', lightingWm2: 6, equipmentWm2: 40, equipmentPointLoadW: 0, infiltrationLs: 0, saTemperatureC: 12, achRequiredSupply: 8, achRequiredOA: 4, isHWCReheatZone: true },
  { id: '4', tag: 'L2-01', name: 'Write-up Office', floor: 'Level 2', ahuTag: 'AHU-02', subZoneTag: 'HWC-L02-01', areaM2: 60, heightM: 3.0, summerRoomTempC: 23, winterRoomTempC: 21, facadeOrientation: 'S', facadeType: 'FT02', facadeWidthM: 10, windowWidthM: 8, windowHeightM: 2.4, hasRoof: false, exposedRoofAreaM2: 0, roofType: 'roof_other', occupants: 6, oaMethod: 'green', lightingWm2: 6, equipmentWm2: 15, equipmentPointLoadW: 0, infiltrationLs: 0, saTemperatureC: 12, achRequiredSupply: 0, achRequiredOA: 0, isHWCReheatZone: true },
  { id: '5', tag: 'L8-01', name: 'Rooftop Plant Room', floor: 'Level 8', ahuTag: 'AHU-03', subZoneTag: '', areaM2: 120, heightM: 4.0, summerRoomTempC: 23, winterRoomTempC: 21, facadeOrientation: 'N', facadeType: 'FT01', facadeWidthM: 12, windowWidthM: 4, windowHeightM: 2.0, hasRoof: true, exposedRoofAreaM2: 120, roofType: 'roof_top', occupants: 0, oaMethod: 'general', lightingWm2: 6, equipmentWm2: 60, equipmentPointLoadW: 0, infiltrationLs: 5, saTemperatureC: 12, achRequiredSupply: 6, achRequiredOA: 2, isHWCReheatZone: false },
];

function buildRecords(inputs: ZoneInputs[]): ZoneRecord[] {
  return inputs.map((z) => ({ inputs: z, results: calculateZone(z) }));
}

interface ZoneStore {
  zones: ZoneRecord[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  updateZone: (id: string, patch: Partial<ZoneInputs>) => void;
  addZone: () => void;
}

export const useZoneStore = create<ZoneStore>((set, get) => ({
  zones: buildRecords(DEFAULT_ZONES),
  selectedId: DEFAULT_ZONES[0].id,

  setSelectedId: (id) => set({ selectedId: id }),

  updateZone: (id, patch) => {
    const zones = get().zones.map((z) => {
      if (z.inputs.id !== id) return z;
      const newInputs = { ...z.inputs, ...patch };
      return { inputs: newInputs, results: calculateZone(newInputs) };
    });
    set({ zones });
  },

  addZone: () => {
    const id = Date.now().toString();
    const newInput: ZoneInputs = {
      id, tag: `Z-${id.slice(-4)}`, name: 'New Zone', floor: 'Level 1', ahuTag: 'AHU-01',
      subZoneTag: '', areaM2: 50, heightM: 3.0, summerRoomTempC: 23, winterRoomTempC: 21,
      facadeOrientation: 'Internal', facadeType: 'FT01', facadeWidthM: 0, windowWidthM: 0,
      windowHeightM: 0, hasRoof: false, exposedRoofAreaM2: 0, roofType: 'roof_other',
      occupants: 5, oaMethod: 'general', lightingWm2: 6, equipmentWm2: 15,
      equipmentPointLoadW: 0, infiltrationLs: 0, saTemperatureC: 12,
      achRequiredSupply: 0, achRequiredOA: 0, isHWCReheatZone: false,
    };
    set((s) => ({
      zones: [...s.zones, { inputs: newInput, results: calculateZone(newInput) }],
      selectedId: id,
    }));
  },
}));

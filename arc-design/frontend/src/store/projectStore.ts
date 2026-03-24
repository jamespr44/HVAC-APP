import { create } from 'zustand';

function syncZoneSchedulesWithProjectSettings() {
  // Lazy import prevents a static cycle: zoneStore already imports projectStore for calculations.
  void import('./zoneStore').then(({ useZoneStore }) => {
    useZoneStore.getState().recalculateAllZones();
  });
}

// ─── REFERENCE LOADS (AIRAH DA09 / ASHRAE 90.1 benchmarks) ─────────────────
export const REFERENCE_LOADS: Record<string, {
  label: string;
  lightingWm2Ref: number;
  equipmentWm2Ref: number;
  occupantDensityM2: number; // m² per person
  oaLsPerPerson: number;
  achSupplyRef: number;
  achOARef: number;
  filtration: string;
  pressureReg: string;
  wm2Min: number; // total sensible load range min
  wm2Max: number;
  note: string;
}> = {
  general_office: { label: 'General Office', lightingWm2Ref: 9, equipmentWm2Ref: 15, occupantDensityM2: 10, oaLsPerPerson: 7.5, achSupplyRef: 0, achOARef: 0, filtration: 'F7', pressureReg: 'Neutral', wm2Min: 40, wm2Max: 70, note: 'AIRAH DA09 / AS1668.2' },
  meeting_room: { label: 'Meeting Room', lightingWm2Ref: 9, equipmentWm2Ref: 10, occupantDensityM2: 2, oaLsPerPerson: 7.5, achSupplyRef: 0, achOARef: 0, filtration: 'F7', pressureReg: 'Neutral', wm2Min: 50, wm2Max: 100, note: 'High occupancy density' },
  general_lab: { label: 'General Lab', lightingWm2Ref: 10, equipmentWm2Ref: 40, occupantDensityM2: 10, oaLsPerPerson: 7.5, achSupplyRef: 8, achOARef: 4, filtration: 'F9', pressureReg: 'Negative', wm2Min: 80, wm2Max: 150, note: 'AS/NZS 2243 lab code' },
  wet_lab: { label: 'Wet Lab', lightingWm2Ref: 10, equipmentWm2Ref: 60, occupantDensityM2: 10, oaLsPerPerson: 7.5, achSupplyRef: 10, achOARef: 10, filtration: 'F9', pressureReg: 'Negative', wm2Min: 100, wm2Max: 200, note: '100% OA typically required' },
  write_up_office: { label: 'Write-up Office', lightingWm2Ref: 9, equipmentWm2Ref: 15, occupantDensityM2: 8, oaLsPerPerson: 7.5, achSupplyRef: 0, achOARef: 0, filtration: 'F7', pressureReg: 'Neutral', wm2Min: 40, wm2Max: 65, note: 'Similar to general office' },
  gmp: { label: 'GMP / Cleanroom', lightingWm2Ref: 10, equipmentWm2Ref: 50, occupantDensityM2: 15, oaLsPerPerson: 11.25, achSupplyRef: 20, achOARef: 4, filtration: 'HEPA', pressureReg: 'Positive', wm2Min: 80, wm2Max: 180, note: 'ISO 14644 / GMP guide' },
  l2d: { label: 'L2D (Lab to Design)', lightingWm2Ref: 10, equipmentWm2Ref: 60, occupantDensityM2: 10, oaLsPerPerson: 7.5, achSupplyRef: 10, achOARef: 6, filtration: 'F9', pressureReg: 'Negative', wm2Min: 80, wm2Max: 160, note: 'Hybrid office/lab' },
  ante_circulation: { label: 'Ante / Circulation', lightingWm2Ref: 6, equipmentWm2Ref: 5, occupantDensityM2: 20, oaLsPerPerson: 7.5, achSupplyRef: 0, achOARef: 0, filtration: 'F7', pressureReg: 'Positive', wm2Min: 15, wm2Max: 35, note: 'Buffer space' },
  atrium: { label: 'Atrium', lightingWm2Ref: 5, equipmentWm2Ref: 5, occupantDensityM2: 5, oaLsPerPerson: 7.5, achSupplyRef: 0, achOARef: 0, filtration: 'F7', pressureReg: 'Neutral', wm2Min: 20, wm2Max: 50, note: 'Stratification potential' },
  server_room: { label: 'Server / IT Room', lightingWm2Ref: 10, equipmentWm2Ref: 500, occupantDensityM2: 50, oaLsPerPerson: 7.5, achSupplyRef: 0, achOARef: 0, filtration: 'F7', pressureReg: 'Positive', wm2Min: 400, wm2Max: 1200, note: 'IT load dominated — verify with client' },
  kitchen: { label: 'Commercial Kitchen', lightingWm2Ref: 10, equipmentWm2Ref: 150, occupantDensityM2: 10, oaLsPerPerson: 7.5, achSupplyRef: 15, achOARef: 15, filtration: 'G4', pressureReg: 'Negative', wm2Min: 150, wm2Max: 400, note: 'AS1668.1 exhaust required' },
  plant_room: { label: 'Plant Room', lightingWm2Ref: 6, equipmentWm2Ref: 60, occupantDensityM2: 50, oaLsPerPerson: 7.5, achSupplyRef: 6, achOARef: 2, filtration: 'G4', pressureReg: 'Neutral', wm2Min: 30, wm2Max: 100, note: 'Maintenance access only' },
  custom: { label: 'Custom', lightingWm2Ref: 0, equipmentWm2Ref: 0, occupantDensityM2: 10, oaLsPerPerson: 7.5, achSupplyRef: 0, achOARef: 0, filtration: 'F7', pressureReg: 'Neutral', wm2Min: 0, wm2Max: 0, note: 'User-defined' },
};

// ─── CUSTOM FACADE TYPE ────────────────────────────────────────────────────
export interface CustomFacadeType {
  id: string;
  name: string;
  uValue: number;
  shgc: number;
  hapLoads: {
    N?: { glass: number; wall: number };
    E?: { glass: number; wall: number };
    S?: { glass: number; wall: number };
    W?: { glass: number; wall: number };
    WS?: { glass: number; wall: number };
    S_SHD?: { glass: number; wall: number };
  };
  winterLoads: {
    N?: { glass: number; wall: number };
    E?: { glass: number; wall: number };
    S?: { glass: number; wall: number };
    W?: { glass: number; wall: number };
  };
}

// ─── EQUIPMENT TYPES ──────────────────────────────────────────────────────
export interface AHURecord {
  id: string;
  tag: string;
  location: string;
  systemType: 'Lab' | 'Comfort' | 'Critical' | 'General';
  supplyLs: number;     // from zones — auto-populated
  oaLs: number;
  sensibleKw: number;
  latentKw: number;
  totalCoolingKw: number;
  heatingKw: number;
  chwLs: number;        // at 6/14°C CHW
  hhwLs: number;        // at 50/30°C HHW
  saTemperatureC: number;
  offCoilDbC: number;
  filterClass: string;
  economyCycle: boolean;
  heatReclaim: boolean;
  dutySandby: 'Single' | 'Duty/Standby' | 'Duty/Assist';
  extStaticPa: number;
  arrangement: string;
  notes: string;
}

export interface FCURecord {
  id: string;
  tag: string;
  location: string;
  roomTag: string;
  supplyLs: number;
  coolingKw: number;
  heatingKw: number;
  chwLs: number;
  hhwLs: number;
  filterClass: string;
  notes: string;
}

export interface FanRecord {
  id: string;
  tag: string;
  type: 'Supply' | 'Return' | 'Exhaust' | 'Transfer' | 'Smoke' | 'General';
  location: string;
  servesZone: string;
  flowLs: number;
  staticPa: number;
  motorKw: number;
  dutySandby: 'Single' | 'Duty/Standby';
  notes: string;
}

export interface PumpRecord {
  id: string;
  tag: string;
  service: 'CHW Primary' | 'CHW Secondary' | 'HHW' | 'Condenser' | 'General';
  flowLs: number;
  headKpa: number;
  motorKw: number;
  dutySandby: 'Single' | 'Duty/Standby';
  notes: string;
}

export interface ChillerRecord {
  id: string;
  tag: string;
  type: 'Centrifugal' | 'Screw' | 'Scroll' | 'Absorption';
  coolingKw: number;
  cop: number;
  inputKw: number;       // auto = coolingKw / cop
  chwInC: number;        // 12°C
  chwOutC: number;       // 6°C
  cwInC: number;         // 29°C
  cwOutC: number;        // 35°C
  chwFlowLs: number;     // auto
  cwFlowLs: number;      // auto
  refrigerant: string;
  dutySandby: 'Single' | 'Duty/Standby' | 'N+1';
  notes: string;
}

export interface CoolingTowerRecord {
  id: string;
  tag: string;
  servedByChiller: string;   // chiller tag
  capacityKw: number;        // = chiller cooling + compressor heat
  cwFlowLs: number;
  cwInC: number;
  cwOutC: number;
  approachC: number;         // cwOut - wetBulb
  rangeC: number;            // cwIn - cwOut
  fanKw: number;
  dutySandby: 'Single' | 'Duty/Standby';
  notes: string;
}

// ─── PROJECT INFO ─────────────────────────────────────────────────────────
export interface ProjectInfo {
  name: string;
  projectNo: string;
  client: string;
  address: string;
  buildingClass: string;
  climateLocation: string;
  summerDbC: number;
  summerWbC: number;
  winterDbC: number;
  summerIndoorC: number;
  winterIndoorC: number;
  altitudeM: number;
  engineer: string;
  checker: string;
  revision: string;
  date: string;
}

// ─── STORE ────────────────────────────────────────────────────────────────
interface ProjectStore {
  info: ProjectInfo;
  customFacadeTypes: CustomFacadeType[];
  roomTypePresets: Record<string, { label: string; lightingWm2: number; equipmentWm2: number }>;

  // Equipment
  ahus: AHURecord[];
  fcus: FCURecord[];
  fans: FanRecord[];
  pumps: PumpRecord[];
  chillers: ChillerRecord[];
  coolingTowers: CoolingTowerRecord[];

  // Actions
  setInfo: (patch: Partial<ProjectInfo>) => void;
  addFacadeType: (ft: CustomFacadeType) => void;
  updateFacadeType: (id: string, patch: Partial<CustomFacadeType>) => void;
  removeFacadeType: (id: string) => void;
  addRoomTypePreset: (id: string, data: { label: string; lightingWm2: number; equipmentWm2: number }) => void;

  // Equipment actions
  addAHU: () => void;
  updateAHU: (id: string, patch: Partial<AHURecord>) => void;
  removeAHU: (id: string) => void;
  addFCU: () => void;
  updateFCU: (id: string, patch: Partial<FCURecord>) => void;
  removeFCU: (id: string) => void;
  addFan: () => void;
  updateFan: (id: string, patch: Partial<FanRecord>) => void;
  removeFan: (id: string) => void;
  addPump: () => void;
  updatePump: (id: string, patch: Partial<PumpRecord>) => void;
  removePump: (id: string) => void;
  addChiller: () => void;
  updateChiller: (id: string, patch: Partial<ChillerRecord>) => void;
  removeChiller: (id: string) => void;
  syncCoolingTowers: () => void;
}

const DEFAULT_AHUS: AHURecord[] = [
  { id: 'ahu1', tag: 'AHU-01', location: 'Level 1 Plant Room', systemType: 'Lab', supplyLs: 1660, oaLs: 687, sensibleKw: 20.9, latentKw: 3.2, totalCoolingKw: 24.1, heatingKw: 3.4, chwLs: 0.72, hhwLs: 0.04, saTemperatureC: 12, offCoilDbC: 12, filterClass: 'F9', economyCycle: false, heatReclaim: true, dutySandby: 'Single', extStaticPa: 500, arrangement: 'Draw-through', notes: '' },
  { id: 'ahu2', tag: 'AHU-02', location: 'Level 2 Plant Room', systemType: 'Comfort', supplyLs: 225, oaLs: 68, sensibleKw: 3.0, latentKw: 0.5, totalCoolingKw: 3.5, heatingKw: 0.8, chwLs: 0.10, hhwLs: 0.01, saTemperatureC: 12, offCoilDbC: 12, filterClass: 'F7', economyCycle: true, heatReclaim: false, dutySandby: 'Single', extStaticPa: 350, arrangement: 'Draw-through', notes: '' },
  { id: 'ahu3', tag: 'AHU-03', location: 'Roof Level 8', systemType: 'Critical', supplyLs: 1200, oaLs: 1200, sensibleKw: 8.5, latentKw: 1.7, totalCoolingKw: 10.2, heatingKw: 1.5, chwLs: 0.30, hhwLs: 0.02, saTemperatureC: 12, offCoilDbC: 12, filterClass: 'F7', economyCycle: false, heatReclaim: false, dutySandby: 'Duty/Standby', extStaticPa: 600, arrangement: 'Draw-through', notes: '100% OA' },
];

const DEFAULT_FCUS: FCURecord[] = [
  { id: 'fcu1', tag: 'FCU-01-01', location: 'Level 1 Lobby', roomTag: 'L1-LBY', supplyLs: 120, coolingKw: 1.8, heatingKw: 0.5, chwLs: 0.054, hhwLs: 0.006, filterClass: 'G4', notes: '' },
  { id: 'fcu2', tag: 'FCU-01-02', location: 'Level 1 Break Room', roomTag: 'L1-BRK', supplyLs: 80, coolingKw: 1.2, heatingKw: 0.3, chwLs: 0.036, hhwLs: 0.004, filterClass: 'G4', notes: '' },
];

const DEFAULT_FANS: FanRecord[] = [
  { id: 'fan1', tag: 'EF-01-01', type: 'Exhaust', location: 'Level 1 Lab', servesZone: 'L1-03', flowLs: 600, staticPa: 300, motorKw: 0.37, dutySandby: 'Duty/Standby', notes: 'Fume cupboard exhaust' },
  { id: 'fan2', tag: 'SF-01-01', type: 'Supply', location: 'Roof', servesZone: 'All L1', flowLs: 1660, staticPa: 700, motorKw: 4.0, dutySandby: 'Single', notes: 'AHU-01 supply fan' },
];

const DEFAULT_PUMPS: PumpRecord[] = [
  { id: 'p1', tag: 'CHWP-01', service: 'CHW Primary', flowLs: 1.12, headKpa: 180, motorKw: 0.55, dutySandby: 'Duty/Standby', notes: '' },
  { id: 'p2', tag: 'HHWP-01', service: 'HHW', flowLs: 0.07, headKpa: 120, motorKw: 0.18, dutySandby: 'Single', notes: '' },
];

const DEFAULT_CHILLERS: ChillerRecord[] = [
  { id: 'ch1', tag: 'CH-01', type: 'Screw', coolingKw: 37.8, cop: 4.2, inputKw: 9.0, chwInC: 12, chwOutC: 6, cwInC: 29, cwOutC: 35, chwFlowLs: 1.12, cwFlowLs: 1.5, refrigerant: 'R134a', dutySandby: 'Duty/Standby', notes: '' },
];

function buildCoolingTowers(chillers: ChillerRecord[]): CoolingTowerRecord[] {
  return chillers.map((ch, i) => {
    const heatRejection = ch.coolingKw + ch.inputKw;
    const cwFlowLs = ch.cwFlowLs;
    const range = heatRejection > 0 && cwFlowLs > 0 ? heatRejection / (4.19 * cwFlowLs) : 6;
    return {
      id: `ct${i + 1}`,
      tag: `CT-0${i + 1}`,
      servedByChiller: ch.tag,
      capacityKw: Math.round(heatRejection * 10) / 10,
      cwFlowLs,
      cwInC: ch.cwOutC,
      cwOutC: ch.cwInC,
      approachC: ch.cwInC - 23, // approximate based on 23°C WB (Sydney)
      rangeC: Math.round(range * 10) / 10,
      fanKw: Math.max(0.75, heatRejection * 0.015),
      dutySandby: 'Single',
      notes: `Serves ${ch.tag}`,
    };
  });
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  info: {
    name: 'Sydney Research Building',
    projectNo: '260203',
    client: 'University of NSW',
    address: '123 Science Drive, Sydney NSW 2000',
    buildingClass: '5 — Office / Lab',
    climateLocation: 'Sydney (BoM Station 066062)',
    summerDbC: 37,
    summerWbC: 25,
    winterDbC: 6,
    summerIndoorC: 23,
    winterIndoorC: 21,
    altitudeM: 6,
    engineer: 'J. Giannopoulos',
    checker: '',
    revision: 'A',
    date: '2026-03-24',
  },

  customFacadeTypes: [
    {
      id: 'FT01', name: 'FT01 — Standard Double Glaze',
      uValue: 3.23, shgc: 0.197,
      hapLoads: { N: { glass: 103, wall: 19 }, E: { glass: 84, wall: 17 }, S: { glass: 64, wall: 13 }, W: { glass: 106, wall: 20 }, WS: { glass: 71.7, wall: 20 }, S_SHD: { glass: 57, wall: 13 } },
      winterLoads: { N: { glass: 48, wall: 15 }, E: { glass: 48, wall: 15 }, S: { glass: 48, wall: 15 }, W: { glass: 48, wall: 15 } },
    },
    {
      id: 'FT02', name: 'FT02 — Performance Double Glaze',
      uValue: 2.20, shgc: 0.240,
      hapLoads: { N: { glass: 109, wall: 19 }, E: { glass: 92, wall: 17 }, S: { glass: 59, wall: 13 }, W: { glass: 111, wall: 20 }, WS: { glass: 93.6, wall: 20 }, S_SHD: { glass: 49, wall: 13 } },
      winterLoads: { N: { glass: 33, wall: 15 }, E: { glass: 33, wall: 15 }, S: { glass: 33, wall: 15 }, W: { glass: 33, wall: 15 } },
    },
    {
      id: 'FT04', name: 'FT04 — With Overhang (Shaded)',
      uValue: 2.33, shgc: 0.220,
      hapLoads: { N: { glass: 66, wall: 19 } },
      winterLoads: {},
    },
  ],

  roomTypePresets: Object.fromEntries(
    Object.entries(REFERENCE_LOADS).map(([k, v]) => [k, { label: v.label, lightingWm2: v.lightingWm2Ref, equipmentWm2: v.equipmentWm2Ref }])
  ),

  ahus: DEFAULT_AHUS,
  fcus: DEFAULT_FCUS,
  fans: DEFAULT_FANS,
  pumps: DEFAULT_PUMPS,
  chillers: DEFAULT_CHILLERS,
  coolingTowers: buildCoolingTowers(DEFAULT_CHILLERS),

  setInfo: (patch) => {
    set((s) => ({ info: { ...s.info, ...patch } }));
    syncZoneSchedulesWithProjectSettings();
  },

  addFacadeType: (ft) => {
    set((s) => ({ customFacadeTypes: [...s.customFacadeTypes, ft] }));
    syncZoneSchedulesWithProjectSettings();
  },
  updateFacadeType: (id, patch) => {
    set((s) => ({
      customFacadeTypes: s.customFacadeTypes.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
    syncZoneSchedulesWithProjectSettings();
  },
  removeFacadeType: (id) => {
    set((s) => ({ customFacadeTypes: s.customFacadeTypes.filter((f) => f.id !== id) }));
    syncZoneSchedulesWithProjectSettings();
  },
  addRoomTypePreset: (id, data) => set((s) => ({ roomTypePresets: { ...s.roomTypePresets, [id]: data } })),

  addAHU: () => {
    const id = `ahu${Date.now()}`;
    const tag = `AHU-0${get().ahus.length + 1}`;
    const newAHU: AHURecord = { id, tag, location: '', systemType: 'Comfort', supplyLs: 0, oaLs: 0, sensibleKw: 0, latentKw: 0, totalCoolingKw: 0, heatingKw: 0, chwLs: 0, hhwLs: 0, saTemperatureC: 12, offCoilDbC: 12, filterClass: 'F7', economyCycle: false, heatReclaim: false, dutySandby: 'Single', extStaticPa: 400, arrangement: 'Draw-through', notes: '' };
    set((s) => ({ ahus: [...s.ahus, newAHU] }));
  },
  updateAHU: (id, patch) => set((s) => ({ ahus: s.ahus.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
  removeAHU: (id) => set((s) => ({ ahus: s.ahus.filter((a) => a.id !== id) })),

  addFCU: () => {
    const id = `fcu${Date.now()}`;
    set((s) => ({ fcus: [...s.fcus, { id, tag: '', location: '', roomTag: '', supplyLs: 0, coolingKw: 0, heatingKw: 0, chwLs: 0, hhwLs: 0, filterClass: 'G4', notes: '' }] }));
  },
  updateFCU: (id, patch) => set((s) => ({ fcus: s.fcus.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
  removeFCU: (id) => set((s) => ({ fcus: s.fcus.filter((f) => f.id !== id) })),

  addFan: () => {
    const id = `fan${Date.now()}`;
    set((s) => ({ fans: [...s.fans, { id, tag: '', type: 'Exhaust', location: '', servesZone: '', flowLs: 0, staticPa: 0, motorKw: 0, dutySandby: 'Single', notes: '' }] }));
  },
  updateFan: (id, patch) => set((s) => ({ fans: s.fans.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
  removeFan: (id) => set((s) => ({ fans: s.fans.filter((f) => f.id !== id) })),

  addPump: () => {
    const id = `pump${Date.now()}`;
    set((s) => ({ pumps: [...s.pumps, { id, tag: '', service: 'CHW Primary', flowLs: 0, headKpa: 0, motorKw: 0, dutySandby: 'Single', notes: '' }] }));
  },
  updatePump: (id, patch) => set((s) => ({ pumps: s.pumps.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  removePump: (id) => set((s) => ({ pumps: s.pumps.filter((p) => p.id !== id) })),

  addChiller: () => {
    const id = `ch${Date.now()}`;
    const newCh: ChillerRecord = { id, tag: `CH-0${get().chillers.length + 1}`, type: 'Screw', coolingKw: 0, cop: 4.2, inputKw: 0, chwInC: 12, chwOutC: 6, cwInC: 29, cwOutC: 35, chwFlowLs: 0, cwFlowLs: 0, refrigerant: 'R134a', dutySandby: 'Single', notes: '' };
    set((s) => ({ chillers: [...s.chillers, newCh] }));
    get().syncCoolingTowers();
  },
  updateChiller: (id, patch) => {
    set((s) => ({ chillers: s.chillers.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
    get().syncCoolingTowers();
  },
  removeChiller: (id) => {
    set((s) => ({ chillers: s.chillers.filter((c) => c.id !== id) }));
    get().syncCoolingTowers();
  },

  syncCoolingTowers: () => {
    const { chillers } = get();
    set({ coolingTowers: buildCoolingTowers(chillers) });
  },
}));

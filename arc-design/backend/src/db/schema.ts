import { pgTable, uuid, text, integer, numeric, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const organisations = pgTable('organisations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull().default('trial'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => organisations.id),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').default('engineer'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').notNull().references(() => organisations.id),
  name: text('name').notNull(),
  address: text('address'),
  climateLocation: text('climate_location').notNull().default('Sydney'),
  buildingClass: text('building_class'),
  status: text('status').default('active'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const floors = pgTable('floors', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  orgId: uuid('org_id').notNull().references(() => organisations.id),
  name: text('name').notNull(),
  levelNo: integer('level_no').notNull(),
  floorArea: numeric('floor_area'),
  sortOrder: integer('sort_order').default(0),
  gaPdfKey: text('ga_pdf_key'),
  gaPdfUrl: text('ga_pdf_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const hvacSystems = pgTable('hvac_systems', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  orgId: uuid('org_id').notNull().references(() => organisations.id),
  tag: text('tag').notNull(),
  type: text('type').notNull(),
  floorId: uuid('floor_id').references(() => floors.id),
  designSupplyLs: numeric('design_supply_l_s'),
  designOALs: numeric('design_oa_l_s'),
  coolingCapacityKw: numeric('cooling_capacity_kw'),
  heatingCapacityKw: numeric('heating_capacity_kw'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const zones = pgTable('zones', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  orgId: uuid('org_id').notNull().references(() => organisations.id),
  floorId: uuid('floor_id').notNull().references(() => floors.id),
  systemId: uuid('system_id').references(() => hvacSystems.id),

  tag: text('tag').notNull(),
  name: text('name').notNull(),
  roomNumber: text('room_number'),

  areaM2: numeric('area_m2').notNull(),
  heightM: numeric('height_m').notNull().default('3.0'),
  volumeM3: numeric('volume_m3'),

  // Orientation & facade
  orientation: text('orientation').default('Internal'),
  facadeType: text('facade_type').default('FT01'),           // FT01 | FT02 | FT04 | Partition
  facadeWidthM: numeric('facade_width_m').default('0'),
  windowWidthM: numeric('window_width_m').default('0'),
  windowHeightM: numeric('window_height_m').default('0'),

  // Legacy envelope fields (kept for backwards compat)
  hasExternalWall: boolean('has_external_wall').default(true),
  hasRoof: boolean('has_roof').default(false),
  exposedRoofM2: numeric('exposed_roof_m2').default('0'),
  roofType: text('roof_type').default('roof_other'),          // roof_top | roof_other
  glazingPct: numeric('glazing_pct').default('20'),
  wallUValue: numeric('wall_u_value').default('0.35'),
  glassUValue: numeric('glass_u_value').default('2.8'),
  glassShgc: numeric('glass_shgc').default('0.4'),
  roofUValue: numeric('roof_u_value').default('0.2'),

  // Occupancy
  occupants: integer('occupants').default(0),
  occAreaMin: numeric('occ_area_min'),                       // area / 10 (auto-calc)
  occCounted: integer('occ_counted'),                        // counted occupants
  occSelected: numeric('occ_selected'),                      // selected (engineer choice)
  occupantActivity: text('occupant_activity').default('seated'),
  occupantSchedule: text('occupant_schedule').default('office_hours'),
  oaMethod: text('oa_method').default('general'),            // general | green | custom
  customOaLsPerPerson: numeric('custom_oa_l_s_person'),

  // Internal loads
  lightingWm2: numeric('lighting_w_m2').default('6'),
  equipmentWm2: numeric('equipment_w_m2').default('15'),
  equipmentPointLoadW: numeric('equipment_point_load_w'),

  // Environment
  tempCoolingC: numeric('temp_cooling_c').default('23'),
  tempHeatingC: numeric('temp_heating_c').default('21'),
  humidityMinPct: numeric('humidity_min_pct').default('40'),
  humidityMaxPct: numeric('humidity_max_pct').default('60'),

  // Supply air & ventilation
  saTemperatureC: numeric('sa_temp_selected_c').default('12'),
  achRequiredSupply: numeric('ach_required_supply').default('0'),
  achRequiredOA: numeric('ach_required_oa').default('0'),
  infiltrationLs: numeric('infiltration_l_s').default('0'),
  achSupply: numeric('ach_supply'),
  achReturn: numeric('ach_return'),
  achExhaust: numeric('ach_exhaust'),
  oaLsPerson: numeric('oa_l_s_person').default('7.5'),
  oaLsM2: numeric('oa_l_s_m2').default('0'),
  exhaustLs: numeric('exhaust_l_s'),

  // Pressure
  pressureRegime: text('pressure_regime').default('neutral'),
  pressurePa: numeric('pressure_pa').default('0'),

  // System classification
  subZoneTag: text('sub_zone_tag'),                          // HWC-L01-xx tag
  isReheatZone: boolean('is_reheat_zone').default(false),
  filtrationClass: text('filtration_class').default('F7'),
  is100pctOa: boolean('is_100pct_oa').default(false),
  cleanlinessClass: text('cleanliness_class'),
  isCriticalSpace: boolean('is_critical_space').default(false),
  zoneType: text('zone_type').default('general'),

  // ── Calculated results (cooling) ──
  calcCoolingSensibleKw: numeric('calc_cooling_sensible_kw'),
  calcCoolingLatentKw: numeric('calc_cooling_latent_kw'),
  calcCoolingTotalKw: numeric('calc_cooling_total_kw'),
  calcSupplyLs: numeric('calc_supply_l_s'),
  calcOaLs: numeric('calc_oa_l_s'),
  calcSupplyTempC: numeric('calc_supply_temp_c'),
  calcSupplyRhPct: numeric('calc_supply_rh_pct'),
  calcWPerM2: numeric('calc_w_per_m2'),

  // ── Calculated results (detailed breakdown) ──
  calcGlassSolarW: numeric('calc_glass_solar_w'),
  calcWallTransW: numeric('calc_wall_trans_w'),
  calcRoofTransW: numeric('calc_roof_trans_w'),
  calcInfiltrationW: numeric('calc_infiltration_w'),
  calcSaForLoadLs: numeric('calc_sa_for_load_l_s'),
  calcOaForOccLs: numeric('calc_oa_for_occ_l_s'),
  calcSaAch: numeric('calc_sa_ach'),
  calcOaAch: numeric('calc_oa_ach'),
  calcSaTempRequiredC: numeric('calc_sa_temp_required_c'),
  calcRoomTempResultC: numeric('calc_room_temp_result_c'),
  calcLatentWPerLs: numeric('calc_latent_w_per_ls'),

  // ── Calculated results (heating) ──
  calcHeatingKw: numeric('calc_heating_kw'),
  calcHeatingGlassW: numeric('calc_heating_glass_w'),
  calcHeatingFacadeW: numeric('calc_heating_facade_w'),
  calcHeatingRoofW: numeric('calc_heating_roof_w'),
  calcHeatingTotalW: numeric('calc_heating_total_w'),
  calcHtgSaTempC: numeric('calc_htg_sa_temp_c'),

  calcAt: timestamp('calc_at', { withTimezone: true }),

  sortOrder: integer('sort_order').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index('idx_zones_project').on(table.projectId),
  floorIdx: index('idx_zones_floor').on(table.floorId),
  systemIdx: index('idx_zones_system').on(table.systemId),
}));

export const zoneChanges = pgTable('zone_changes', {
  id: uuid('id').defaultRandom().primaryKey(),
  zoneId: uuid('zone_id').notNull().references(() => zones.id),
  orgId: uuid('org_id').notNull().references(() => organisations.id),
  userId: uuid('user_id').references(() => users.id),
  changedFields: jsonb('changed_fields').notNull(),
  reason: text('reason'),
  revisionId: uuid('revision_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  zoneIdx: index('idx_zone_changes_zone').on(table.zoneId),
  tsIdx: index('idx_zone_changes_ts').on(table.createdAt).desc(),
}));

export const revisions = pgTable('revisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  orgId: uuid('org_id').notNull().references(() => organisations.id),
  name: text('name').notNull(),
  description: text('description'),
  snapshot: jsonb('snapshot').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index('idx_revisions_project').on(table.projectId),
}));

export const zoneAnnotations = pgTable('zone_annotations', {
  id: uuid('id').defaultRandom().primaryKey(),
  zoneId: uuid('zone_id').notNull().references(() => zones.id),
  floorId: uuid('floor_id').notNull().references(() => floors.id),
  orgId: uuid('org_id').notNull().references(() => organisations.id),
  polygonPoints: jsonb('polygon_points'),
  pdfPage: integer('pdf_page').default(1),
  pdfScale: numeric('pdf_scale').default('1'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  floorIdx: index('idx_annotations_floor').on(table.floorId),
}));

export const climateData = pgTable('climate_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  location: text('location').notNull().unique(),
  state: text('state').notNull(),
  latitude: numeric('latitude').notNull(),
  longitude: numeric('longitude').notNull(),
  summerDbC: numeric('summer_db_c').notNull(),
  summerWbC: numeric('summer_wb_c').notNull(),
  winterDbC: numeric('winter_db_c').notNull(),
  dailyRangeC: numeric('daily_range_c').notNull(),
  altitudeM: integer('altitude_m').default(0),
  bomStationId: text('bom_station_id'),
});

export const equipment = pgTable('equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  orgId: uuid('org_id').notNull().references(() => organisations.id),
  zoneId: uuid('zone_id').references(() => zones.id),

  // Identification
  equipmentType: text('equipment_type').notNull(), // 'ahu', 'fcu', 'fan', 'pump'
  name: text('name').notNull(),
  model: text('model'),
  manufacturer: text('manufacturer'),

  // Performance specs
  airFlowRateM3Sec: numeric('air_flow_rate_m3_sec'), // m³/s (for air-based equipment)
  sensibleCapacityW: numeric('sensible_capacity_w'),
  latentCapacityW: numeric('latent_capacity_w'),
  totalCapacityW: numeric('total_capacity_w'),
  powerInputW: numeric('power_input_w'),
  copOrEfficiency: numeric('cop_or_efficiency'), // COP or efficiency %

  // Pump-specific
  flowRateLPerMin: numeric('flow_rate_l_per_min'),
  headKpa: numeric('head_kpa'),

  // Refrigerant & thermal fluid
  refrigerantType: text('refrigerant_type'), // 'R410A', 'R32', 'R454B', etc.
  refrigerantChargeKg: numeric('refrigerant_charge_kg'),
  thermalFluidType: text('thermal_fluid_type'), // 'water', 'glycol_mix', etc.

  inOperation: boolean('in_operation').default(true),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index('idx_equipment_project').on(table.projectId),
  zoneIdx: index('idx_equipment_zone').on(table.zoneId),
}));

export const equipmentMaintenance = pgTable('equipment_maintenance', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipmentId: uuid('equipment_id').notNull().references(() => equipment.id),
  orgId: uuid('org_id').notNull().references(() => organisations.id),

  maintenanceType: text('maintenance_type').notNull(), // 'filter_change', 'refrigerant_recharge', 'service', 'calibration'
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }),
  description: text('description'),

  lastCompletedDate: timestamp('last_completed_date', { withTimezone: true }),
  nextDueDate: timestamp('next_due_date', { withTimezone: true }),

  frequencyDays: integer('frequency_days'), // e.g., 90 days for filter change

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  equipmentIdx: index('idx_maintenance_equipment').on(table.equipmentId),
  nextDueIdx: index('idx_maintenance_due_date').on(table.nextDueDate),
}));

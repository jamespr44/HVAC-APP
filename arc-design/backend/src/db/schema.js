"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentMaintenance = exports.equipment = exports.climateData = exports.zoneAnnotations = exports.revisions = exports.zoneChanges = exports.zones = exports.hvacSystems = exports.floors = exports.projects = exports.users = exports.organisations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.organisations = (0, pg_core_1.pgTable)('organisations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    slug: (0, pg_core_1.text)('slug').notNull().unique(),
    plan: (0, pg_core_1.text)('plan').notNull().default('trial'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    name: (0, pg_core_1.text)('name'),
    role: (0, pg_core_1.text)('role').default('engineer'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.projects = (0, pg_core_1.pgTable)('projects', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    name: (0, pg_core_1.text)('name').notNull(),
    address: (0, pg_core_1.text)('address'),
    climateLocation: (0, pg_core_1.text)('climate_location').notNull().default('Sydney'),
    buildingClass: (0, pg_core_1.text)('building_class'),
    status: (0, pg_core_1.text)('status').default('active'),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
exports.floors = (0, pg_core_1.pgTable)('floors', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    name: (0, pg_core_1.text)('name').notNull(),
    levelNo: (0, pg_core_1.integer)('level_no').notNull(),
    floorArea: (0, pg_core_1.numeric)('floor_area'),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    gaPdfKey: (0, pg_core_1.text)('ga_pdf_key'),
    gaPdfUrl: (0, pg_core_1.text)('ga_pdf_url'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.hvacSystems = (0, pg_core_1.pgTable)('hvac_systems', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    tag: (0, pg_core_1.text)('tag').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    floorId: (0, pg_core_1.uuid)('floor_id').references(() => exports.floors.id),
    designSupplyLs: (0, pg_core_1.numeric)('design_supply_l_s'),
    designOALs: (0, pg_core_1.numeric)('design_oa_l_s'),
    coolingCapacityKw: (0, pg_core_1.numeric)('cooling_capacity_kw'),
    heatingCapacityKw: (0, pg_core_1.numeric)('heating_capacity_kw'),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.zones = (0, pg_core_1.pgTable)('zones', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    floorId: (0, pg_core_1.uuid)('floor_id').notNull().references(() => exports.floors.id),
    systemId: (0, pg_core_1.uuid)('system_id').references(() => exports.hvacSystems.id),
    tag: (0, pg_core_1.text)('tag').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    roomNumber: (0, pg_core_1.text)('room_number'),
    areaM2: (0, pg_core_1.numeric)('area_m2').notNull(),
    heightM: (0, pg_core_1.numeric)('height_m').notNull().default('3.0'),
    volumeM3: (0, pg_core_1.numeric)('volume_m3'),
    // Orientation & facade
    orientation: (0, pg_core_1.text)('orientation').default('Internal'),
    facadeType: (0, pg_core_1.text)('facade_type').default('FT01'), // FT01 | FT02 | FT04 | Partition
    facadeWidthM: (0, pg_core_1.numeric)('facade_width_m').default('0'),
    windowWidthM: (0, pg_core_1.numeric)('window_width_m').default('0'),
    windowHeightM: (0, pg_core_1.numeric)('window_height_m').default('0'),
    // Legacy envelope fields (kept for backwards compat)
    hasExternalWall: (0, pg_core_1.boolean)('has_external_wall').default(true),
    hasRoof: (0, pg_core_1.boolean)('has_roof').default(false),
    exposedRoofM2: (0, pg_core_1.numeric)('exposed_roof_m2').default('0'),
    roofType: (0, pg_core_1.text)('roof_type').default('roof_other'), // roof_top | roof_other
    glazingPct: (0, pg_core_1.numeric)('glazing_pct').default('20'),
    wallUValue: (0, pg_core_1.numeric)('wall_u_value').default('0.35'),
    glassUValue: (0, pg_core_1.numeric)('glass_u_value').default('2.8'),
    glassShgc: (0, pg_core_1.numeric)('glass_shgc').default('0.4'),
    roofUValue: (0, pg_core_1.numeric)('roof_u_value').default('0.2'),
    // Occupancy
    occupants: (0, pg_core_1.integer)('occupants').default(0),
    occAreaMin: (0, pg_core_1.numeric)('occ_area_min'), // area / 10 (auto-calc)
    occCounted: (0, pg_core_1.integer)('occ_counted'), // counted occupants
    occSelected: (0, pg_core_1.numeric)('occ_selected'), // selected (engineer choice)
    occupantActivity: (0, pg_core_1.text)('occupant_activity').default('seated'),
    occupantSchedule: (0, pg_core_1.text)('occupant_schedule').default('office_hours'),
    oaMethod: (0, pg_core_1.text)('oa_method').default('general'), // general | green | custom
    customOaLsPerPerson: (0, pg_core_1.numeric)('custom_oa_l_s_person'),
    // Internal loads
    lightingWm2: (0, pg_core_1.numeric)('lighting_w_m2').default('6'),
    equipmentWm2: (0, pg_core_1.numeric)('equipment_w_m2').default('15'),
    equipmentPointLoadW: (0, pg_core_1.numeric)('equipment_point_load_w'),
    // Environment
    tempCoolingC: (0, pg_core_1.numeric)('temp_cooling_c').default('23'),
    tempHeatingC: (0, pg_core_1.numeric)('temp_heating_c').default('21'),
    humidityMinPct: (0, pg_core_1.numeric)('humidity_min_pct').default('40'),
    humidityMaxPct: (0, pg_core_1.numeric)('humidity_max_pct').default('60'),
    // Supply air & ventilation
    saTemperatureC: (0, pg_core_1.numeric)('sa_temp_selected_c').default('12'),
    achRequiredSupply: (0, pg_core_1.numeric)('ach_required_supply').default('0'),
    achRequiredOA: (0, pg_core_1.numeric)('ach_required_oa').default('0'),
    infiltrationLs: (0, pg_core_1.numeric)('infiltration_l_s').default('0'),
    achSupply: (0, pg_core_1.numeric)('ach_supply'),
    achReturn: (0, pg_core_1.numeric)('ach_return'),
    achExhaust: (0, pg_core_1.numeric)('ach_exhaust'),
    oaLsPerson: (0, pg_core_1.numeric)('oa_l_s_person').default('7.5'),
    oaLsM2: (0, pg_core_1.numeric)('oa_l_s_m2').default('0'),
    exhaustLs: (0, pg_core_1.numeric)('exhaust_l_s'),
    // Pressure
    pressureRegime: (0, pg_core_1.text)('pressure_regime').default('neutral'),
    pressurePa: (0, pg_core_1.numeric)('pressure_pa').default('0'),
    // System classification
    subZoneTag: (0, pg_core_1.text)('sub_zone_tag'), // HWC-L01-xx tag
    isReheatZone: (0, pg_core_1.boolean)('is_reheat_zone').default(false),
    filtrationClass: (0, pg_core_1.text)('filtration_class').default('F7'),
    is100pctOa: (0, pg_core_1.boolean)('is_100pct_oa').default(false),
    cleanlinessClass: (0, pg_core_1.text)('cleanliness_class'),
    isCriticalSpace: (0, pg_core_1.boolean)('is_critical_space').default(false),
    zoneType: (0, pg_core_1.text)('zone_type').default('general'),
    // ── Calculated results (cooling) ──
    calcCoolingSensibleKw: (0, pg_core_1.numeric)('calc_cooling_sensible_kw'),
    calcCoolingLatentKw: (0, pg_core_1.numeric)('calc_cooling_latent_kw'),
    calcCoolingTotalKw: (0, pg_core_1.numeric)('calc_cooling_total_kw'),
    calcSupplyLs: (0, pg_core_1.numeric)('calc_supply_l_s'),
    calcOaLs: (0, pg_core_1.numeric)('calc_oa_l_s'),
    calcSupplyTempC: (0, pg_core_1.numeric)('calc_supply_temp_c'),
    calcSupplyRhPct: (0, pg_core_1.numeric)('calc_supply_rh_pct'),
    calcWPerM2: (0, pg_core_1.numeric)('calc_w_per_m2'),
    // ── Calculated results (detailed breakdown) ──
    calcGlassSolarW: (0, pg_core_1.numeric)('calc_glass_solar_w'),
    calcWallTransW: (0, pg_core_1.numeric)('calc_wall_trans_w'),
    calcRoofTransW: (0, pg_core_1.numeric)('calc_roof_trans_w'),
    calcInfiltrationW: (0, pg_core_1.numeric)('calc_infiltration_w'),
    calcSaForLoadLs: (0, pg_core_1.numeric)('calc_sa_for_load_l_s'),
    calcOaForOccLs: (0, pg_core_1.numeric)('calc_oa_for_occ_l_s'),
    calcSaAch: (0, pg_core_1.numeric)('calc_sa_ach'),
    calcOaAch: (0, pg_core_1.numeric)('calc_oa_ach'),
    calcSaTempRequiredC: (0, pg_core_1.numeric)('calc_sa_temp_required_c'),
    calcRoomTempResultC: (0, pg_core_1.numeric)('calc_room_temp_result_c'),
    calcLatentWPerLs: (0, pg_core_1.numeric)('calc_latent_w_per_ls'),
    // ── Calculated results (heating) ──
    calcHeatingKw: (0, pg_core_1.numeric)('calc_heating_kw'),
    calcHeatingGlassW: (0, pg_core_1.numeric)('calc_heating_glass_w'),
    calcHeatingFacadeW: (0, pg_core_1.numeric)('calc_heating_facade_w'),
    calcHeatingRoofW: (0, pg_core_1.numeric)('calc_heating_roof_w'),
    calcHeatingTotalW: (0, pg_core_1.numeric)('calc_heating_total_w'),
    calcHtgSaTempC: (0, pg_core_1.numeric)('calc_htg_sa_temp_c'),
    calcAt: (0, pg_core_1.timestamp)('calc_at', { withTimezone: true }),
    sortOrder: (0, pg_core_1.integer)('sort_order').default(0),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    projectIdx: (0, pg_core_1.index)('idx_zones_project').on(table.projectId),
    floorIdx: (0, pg_core_1.index)('idx_zones_floor').on(table.floorId),
    systemIdx: (0, pg_core_1.index)('idx_zones_system').on(table.systemId),
}));
exports.zoneChanges = (0, pg_core_1.pgTable)('zone_changes', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    zoneId: (0, pg_core_1.uuid)('zone_id').notNull().references(() => exports.zones.id),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id),
    changedFields: (0, pg_core_1.jsonb)('changed_fields').notNull(),
    reason: (0, pg_core_1.text)('reason'),
    revisionId: (0, pg_core_1.uuid)('revision_id'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    zoneIdx: (0, pg_core_1.index)('idx_zone_changes_zone').on(table.zoneId),
    tsIdx: (0, pg_core_1.index)('idx_zone_changes_ts').on(table.createdAt).desc(),
}));
exports.revisions = (0, pg_core_1.pgTable)('revisions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    snapshot: (0, pg_core_1.jsonb)('snapshot').notNull(),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    projectIdx: (0, pg_core_1.index)('idx_revisions_project').on(table.projectId),
}));
exports.zoneAnnotations = (0, pg_core_1.pgTable)('zone_annotations', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    zoneId: (0, pg_core_1.uuid)('zone_id').notNull().references(() => exports.zones.id),
    floorId: (0, pg_core_1.uuid)('floor_id').notNull().references(() => exports.floors.id),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    polygonPoints: (0, pg_core_1.jsonb)('polygon_points'),
    pdfPage: (0, pg_core_1.integer)('pdf_page').default(1),
    pdfScale: (0, pg_core_1.numeric)('pdf_scale').default('1'),
    createdBy: (0, pg_core_1.uuid)('created_by').references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    floorIdx: (0, pg_core_1.index)('idx_annotations_floor').on(table.floorId),
}));
exports.climateData = (0, pg_core_1.pgTable)('climate_data', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    location: (0, pg_core_1.text)('location').notNull().unique(),
    state: (0, pg_core_1.text)('state').notNull(),
    latitude: (0, pg_core_1.numeric)('latitude').notNull(),
    longitude: (0, pg_core_1.numeric)('longitude').notNull(),
    summerDbC: (0, pg_core_1.numeric)('summer_db_c').notNull(),
    summerWbC: (0, pg_core_1.numeric)('summer_wb_c').notNull(),
    winterDbC: (0, pg_core_1.numeric)('winter_db_c').notNull(),
    dailyRangeC: (0, pg_core_1.numeric)('daily_range_c').notNull(),
    altitudeM: (0, pg_core_1.integer)('altitude_m').default(0),
    bomStationId: (0, pg_core_1.text)('bom_station_id'),
});
exports.equipment = (0, pg_core_1.pgTable)('equipment', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    zoneId: (0, pg_core_1.uuid)('zone_id').references(() => exports.zones.id),
    // Identification
    equipmentType: (0, pg_core_1.text)('equipment_type').notNull(), // 'ahu', 'fcu', 'fan', 'pump'
    name: (0, pg_core_1.text)('name').notNull(),
    model: (0, pg_core_1.text)('model'),
    manufacturer: (0, pg_core_1.text)('manufacturer'),
    // Performance specs
    airFlowRateM3Sec: (0, pg_core_1.numeric)('air_flow_rate_m3_sec'), // m³/s (for air-based equipment)
    sensibleCapacityW: (0, pg_core_1.numeric)('sensible_capacity_w'),
    latentCapacityW: (0, pg_core_1.numeric)('latent_capacity_w'),
    totalCapacityW: (0, pg_core_1.numeric)('total_capacity_w'),
    powerInputW: (0, pg_core_1.numeric)('power_input_w'),
    copOrEfficiency: (0, pg_core_1.numeric)('cop_or_efficiency'), // COP or efficiency %
    // Pump-specific
    flowRateLPerMin: (0, pg_core_1.numeric)('flow_rate_l_per_min'),
    headKpa: (0, pg_core_1.numeric)('head_kpa'),
    // Refrigerant & thermal fluid
    refrigerantType: (0, pg_core_1.text)('refrigerant_type'), // 'R410A', 'R32', 'R454B', etc.
    refrigerantChargeKg: (0, pg_core_1.numeric)('refrigerant_charge_kg'),
    thermalFluidType: (0, pg_core_1.text)('thermal_fluid_type'), // 'water', 'glycol_mix', etc.
    inOperation: (0, pg_core_1.boolean)('in_operation').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    projectIdx: (0, pg_core_1.index)('idx_equipment_project').on(table.projectId),
    zoneIdx: (0, pg_core_1.index)('idx_equipment_zone').on(table.zoneId),
}));
exports.equipmentMaintenance = (0, pg_core_1.pgTable)('equipment_maintenance', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    equipmentId: (0, pg_core_1.uuid)('equipment_id').notNull().references(() => exports.equipment.id),
    orgId: (0, pg_core_1.uuid)('org_id').notNull().references(() => exports.organisations.id),
    maintenanceType: (0, pg_core_1.text)('maintenance_type').notNull(), // 'filter_change', 'refrigerant_recharge', 'service', 'calibration'
    scheduledDate: (0, pg_core_1.timestamp)('scheduled_date', { withTimezone: true }),
    description: (0, pg_core_1.text)('description'),
    lastCompletedDate: (0, pg_core_1.timestamp)('last_completed_date', { withTimezone: true }),
    nextDueDate: (0, pg_core_1.timestamp)('next_due_date', { withTimezone: true }),
    frequencyDays: (0, pg_core_1.integer)('frequency_days'), // e.g., 90 days for filter change
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    equipmentIdx: (0, pg_core_1.index)('idx_maintenance_equipment').on(table.equipmentId),
    nextDueIdx: (0, pg_core_1.index)('idx_maintenance_due_date').on(table.nextDueDate),
}));

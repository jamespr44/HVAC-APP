"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const heatload_1 = require("../engine/heatload");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.requireAuth);
router.post('/', async (req, res) => {
    const orgId = req.user.org_id;
    const projectId = req.params.projectId;
    try {
        const projectList = await db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projects.id, projectId), (0, drizzle_orm_1.eq)(schema_1.projects.orgId, orgId)));
        const project = projectList[0];
        if (!project)
            return res.status(404).json({ error: 'Project not found' });
        const climateList = await db_1.db.select().from(schema_1.climateData).where((0, drizzle_orm_1.eq)(schema_1.climateData.location, project.climateLocation));
        const climate = climateList[0];
        if (!climate)
            return res.status(400).json({ error: 'Climate data not found for location' });
        const climateInputs = {
            summerDbC: Number(climate.summerDbC),
            summerWbC: Number(climate.summerWbC),
            winterDbC: Number(climate.winterDbC),
            dailyRangeC: Number(climate.dailyRangeC),
            altitudeM: Number(climate.altitudeM),
        };
        const projectZones = await db_1.db.select().from(schema_1.zones).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.zones.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.zones.orgId, orgId)));
        const results = [];
        for (const zone of projectZones) {
            const zoneInputs = {
                roomDesc: zone.name,
                roomCode: zone.tag,
                ahuTag: zone.systemId ?? '',
                subZoneTag: zone.subZoneTag ?? '',
                areaM2: Number(zone.areaM2),
                heightM: Number(zone.heightM),
                winterRoomTempC: Number(zone.tempHeatingC),
                summerRoomTempC: Number(zone.tempCoolingC),
                facadeOrientation: zone.orientation ?? 'Internal',
                facadeType: zone.facadeType ?? 'FT01',
                facadeWidthM: Number(zone.facadeWidthM ?? 0),
                windowWidthM: Number(zone.windowWidthM ?? 0),
                windowHeightM: Number(zone.windowHeightM ?? 0),
                hasRoof: zone.hasRoof ?? false,
                exposedRoofAreaM2: Number(zone.exposedRoofM2 ?? 0),
                roofType: zone.roofType ?? 'roof_other',
                occupants: Number(zone.occSelected ?? zone.occCounted ?? zone.occupants ?? 0),
                oaMethod: zone.oaMethod ?? 'general',
                customOaLsPerPerson: zone.customOaLsPerPerson ? Number(zone.customOaLsPerPerson) : undefined,
                lightingWm2: Number(zone.lightingWm2),
                equipmentWm2: Number(zone.equipmentWm2),
                equipmentPointLoadW: zone.equipmentPointLoadW ? Number(zone.equipmentPointLoadW) : undefined,
                infiltrationLs: Number(zone.infiltrationLs ?? 0),
                saTemperatureC: Number(zone.saTemperatureC ?? 12),
                achRequiredSupply: Number(zone.achRequiredSupply ?? 0),
                achRequiredOA: Number(zone.achRequiredOA ?? 0),
                isHWCReheatZone: zone.isReheatZone ?? false,
            };
            const loadResult = (0, heatload_1.calculateZoneLoads)(zoneInputs, climateInputs);
            const updated = await db_1.db.update(schema_1.zones).set({
                calcCoolingSensibleKw: (loadResult.totalSensibleW / 1000).toFixed(3),
                calcCoolingLatentKw: (loadResult.peopleLatentW / 1000).toFixed(3),
                calcCoolingTotalKw: (loadResult.totalCoolingW / 1000).toFixed(3),
                calcHeatingKw: (loadResult.totalHeatingW / 1000).toFixed(3),
                calcSupplyLs: loadResult.supplyLs.toString(),
                calcOaLs: loadResult.oaLs.toString(),
                calcSupplyTempC: loadResult.supplyTempC.toString(),
                calcWPerM2: loadResult.wPerM2.toString(),
                // Detailed breakdown
                calcGlassSolarW: loadResult.glassSolarW.toFixed(1),
                calcWallTransW: loadResult.wallTransmissionW.toFixed(1),
                calcRoofTransW: loadResult.roofTransmissionW.toFixed(1),
                calcInfiltrationW: loadResult.infiltrationW.toFixed(1),
                calcSaForLoadLs: loadResult.saForLoadLs.toFixed(1),
                calcOaForOccLs: loadResult.oaForOccupancyLs.toFixed(1),
                calcSaAch: loadResult.saAchCalculated.toFixed(2),
                calcOaAch: loadResult.oaAchCalculated.toFixed(2),
                calcSaTempRequiredC: loadResult.saTempRequired.toFixed(1),
                calcRoomTempResultC: loadResult.roomTempIfSaTRemains.toFixed(1),
                calcLatentWPerLs: loadResult.latentWPerLs.toFixed(2),
                // Heating breakdown
                calcHeatingGlassW: loadResult.heatingGlassW.toFixed(1),
                calcHeatingFacadeW: loadResult.heatingFacadeW.toFixed(1),
                calcHeatingRoofW: loadResult.heatingRoofW.toFixed(1),
                calcHeatingTotalW: loadResult.heatingTotalW.toFixed(1),
                calcHtgSaTempC: loadResult.heatingRequiredSATempC.toFixed(1),
                calcAt: new Date(),
            }).where((0, drizzle_orm_1.eq)(schema_1.zones.id, zone.id)).returning();
            results.push(updated[0]);
        }
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;

import { Router, Response } from 'express';
import { db } from '../db';
import { zones, projects, climateData } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { calculateZoneLoads, ClimateInputs, ZoneInputs } from '../engine/heatload';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const projectId = req.params.projectId;

  try {
    const projectList = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.orgId, orgId)));
    const project = projectList[0];
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const climateList = await db.select().from(climateData).where(eq(climateData.location, project.climateLocation));
    const climate = climateList[0];
    if (!climate) return res.status(400).json({ error: 'Climate data not found for location' });

    const climateInputs: ClimateInputs = {
      summerDbC: Number(climate.summerDbC),
      summerWbC: Number(climate.summerWbC),
      winterDbC: Number(climate.winterDbC),
      dailyRangeC: Number(climate.dailyRangeC),
      altitudeM: Number(climate.altitudeM),
    };

    const projectZones = await db.select().from(zones).where(and(eq(zones.projectId, projectId), eq(zones.orgId, orgId)));

    const results = [];
    for (const zone of projectZones) {
      const zoneInputs: ZoneInputs = {
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
        oaMethod: (zone.oaMethod as 'general' | 'green' | 'custom') ?? 'general',
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

      const loadResult = calculateZoneLoads(zoneInputs, climateInputs);

      const updated = await db.update(zones).set({
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
      }).where(eq(zones.id, zone.id)).returning();

      results.push(updated[0]);
    }

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

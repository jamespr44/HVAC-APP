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
        areaM2: Number(zone.areaM2),
        heightM: Number(zone.heightM),
        orientation: zone.orientation!,
        hasExternalWall: zone.hasExternalWall!,
        hasRoof: zone.hasRoof!,
        glazingPct: Number(zone.glazingPct),
        wallUValue: Number(zone.wallUValue),
        glassUValue: Number(zone.glassUValue),
        glassSHGC: Number(zone.glassShgc),
        roofUValue: Number(zone.roofUValue),
        occupants: Number(zone.occupants),
        occupantActivity: zone.occupantActivity!,
        lightingWm2: Number(zone.lightingWm2),
        equipmentWm2: Number(zone.equipmentWm2),
        tempCoolingC: Number(zone.tempCoolingC),
        tempHeatingC: Number(zone.tempHeatingC),
        humidityMaxPct: Number(zone.humidityMaxPct),
        oaMethod: zone.oaMethod as any,
        oaLsPerPerson: Number(zone.oaLsPerson),
        oaLsPerM2: Number(zone.oaLsM2),
        achSupply: zone.achSupply ? Number(zone.achSupply) : undefined,
        exhaustLs: zone.exhaustLs ? Number(zone.exhaustLs) : undefined,
        is100PctOA: zone.is100pctOa!,
      };

      const loadResult = calculateZoneLoads(zoneInputs, climateInputs);
      
      const updated = await db.update(zones).set({
        calcCoolingSensibleKw: (loadResult.totalSensibleW / 1000).toString(),
        calcCoolingLatentKw: (loadResult.totalLatentW / 1000).toString(),
        calcCoolingTotalKw: (loadResult.totalCoolingW / 1000).toString(),
        calcHeatingKw: (loadResult.totalHeatingW / 1000).toString(),
        calcSupplyLs: loadResult.supplyLs.toString(),
        calcOaLs: loadResult.oaLs.toString(),
        calcSupplyTempC: loadResult.supplyTempC.toString(),
        calcSupplyRhPct: loadResult.supplyRhPct.toString(),
        calcWPerM2: loadResult.wPerM2.toString(),
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

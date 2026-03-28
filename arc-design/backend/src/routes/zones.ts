import { Router, Response } from 'express';
import { db } from '../db';
import { zones, zoneChanges } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getZoneEquipmentLoads } from '../services/equipmentLoadCalculator';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const projectId = req.params.projectId;
  try {
    const list = await db.select().from(zones).where(and(eq(zones.projectId, projectId), eq(zones.orgId, orgId)));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const projectId = req.params.projectId;
  try {
    const newZone = await db.insert(zones).values({
      ...req.body,
      projectId,
      orgId,
    }).returning();
    res.status(201).json(newZone[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:zoneId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const userId = req.user!.id;
  const changeReason = req.body.changeReason || 'Update zone';
  delete req.body.changeReason;

  try {
    const updated = await db.transaction(async (tx) => {
      const originalList = await tx.select().from(zones).where(eq(zones.id, req.params.zoneId));
      const original = originalList[0];
      if (!original) throw new Error('Zone not found');

      const changedFields: any = {};
      for (const key in req.body) {
        if (req.body[key] !== (original as any)[key]) {
          changedFields[key] = { from: (original as any)[key], to: req.body[key] };
        }
      }

      const updatedZone = await tx.update(zones).set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(zones.id, req.params.zoneId), eq(zones.orgId, orgId)))
        .returning();

      if (Object.keys(changedFields).length > 0) {
        await tx.insert(zoneChanges).values({
          zoneId: req.params.zoneId,
          orgId,
          userId,
          changedFields,
          reason: changeReason,
        });
      }

      return updatedZone[0];
    });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:zoneId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    await db.delete(zones).where(and(eq(zones.id, req.params.zoneId), eq(zones.orgId, orgId)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete zone' });
  }
});

router.get('/:zoneId/changes', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    const list = await db.select().from(zoneChanges)
      .where(and(eq(zoneChanges.zoneId, req.params.zoneId), eq(zoneChanges.orgId, orgId)))
      .orderBy(zoneChanges.createdAt);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch zone changes' });
  }
});

router.get('/:zoneId/equipment-loads', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { zoneId } = req.params;
  try {
    // Verify zone belongs to this org
    const zone = await db.select().from(zones)
      .where(and(eq(zones.id, zoneId), eq(zones.orgId, orgId)))
      .limit(1);

    if (!zone.length) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    const equipmentLoads = await getZoneEquipmentLoads(zoneId, orgId);

    res.json({
      zoneId,
      zoneName: zone[0].name,
      totalSensibleW: equipmentLoads.totalSensibleW,
      totalLatentW: equipmentLoads.totalLatentW,
      totalW: equipmentLoads.totalSensibleW + equipmentLoads.totalLatentW,
      count: equipmentLoads.equipmentBreakdown.length,
      equipmentBreakdown: equipmentLoads.equipmentBreakdown,
    });
  } catch (error) {
    console.error('Error fetching zone equipment loads:', error);
    res.status(500).json({ error: 'Failed to fetch equipment loads' });
  }
});

export default router;

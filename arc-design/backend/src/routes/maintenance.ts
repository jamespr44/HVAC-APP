import { Router, Response } from 'express';
import { db } from '../db';
import { equipmentMaintenance } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });
router.use(requireAuth);

// GET all maintenance records for an equipment item
router.get('/:equipmentId/maintenance', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { equipmentId } = req.params;

  try {
    const list = await db.select()
      .from(equipmentMaintenance)
      .where(and(
        eq(equipmentMaintenance.equipmentId, equipmentId),
        eq(equipmentMaintenance.orgId, orgId)
      ))
      .orderBy(desc(equipmentMaintenance.nextDueDate));

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
});

// POST create maintenance record
router.post('/:equipmentId/maintenance', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { equipmentId } = req.params;
  const {
    maintenanceType,
    scheduledDate,
    frequencyDays,
    description
  } = req.body;

  // Validate required fields
  if (!maintenanceType) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{ field: 'maintenanceType', message: 'Maintenance type is required' }]
    });
  }

  if (!frequencyDays || frequencyDays <= 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{ field: 'frequencyDays', message: 'Frequency (days) must be positive' }]
    });
  }

  try {
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + frequencyDays);

    const newRecord = await db.insert(equipmentMaintenance).values({
      equipmentId,
      orgId,
      maintenanceType,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      frequencyDays,
      description,
      nextDueDate,
    }).returning();

    res.status(201).json(newRecord[0]);
  } catch (error: any) {
    res.status(400).json({
      error: 'Failed to create maintenance record',
      details: error.message
    });
  }
});

// PATCH mark maintenance as completed
router.patch('/:equipmentId/maintenance/:maintenanceId/complete', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { equipmentId, maintenanceId } = req.params;

  try {
    const original = await db.select()
      .from(equipmentMaintenance)
      .where(and(
        eq(equipmentMaintenance.id, maintenanceId),
        eq(equipmentMaintenance.equipmentId, equipmentId),
        eq(equipmentMaintenance.orgId, orgId)
      ));

    if (!original.length) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    const record = original[0];
    const now = new Date();
    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + record.frequencyDays!);

    const updated = await db.update(equipmentMaintenance)
      .set({
        lastCompletedDate: now,
        nextDueDate: nextDue,
        updatedAt: now,
      })
      .where(eq(equipmentMaintenance.id, maintenanceId))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    res.status(400).json({
      error: 'Failed to complete maintenance record',
      details: error.message
    });
  }
});

// PATCH update maintenance record
router.patch('/:equipmentId/maintenance/:maintenanceId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { equipmentId, maintenanceId } = req.params;

  try {
    const updated = await db.update(equipmentMaintenance)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(and(
        eq(equipmentMaintenance.id, maintenanceId),
        eq(equipmentMaintenance.equipmentId, equipmentId),
        eq(equipmentMaintenance.orgId, orgId)
      ))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json(updated[0]);
  } catch (error: any) {
    res.status(400).json({
      error: 'Failed to update maintenance record',
      details: error.message
    });
  }
});

// DELETE maintenance record
router.delete('/:equipmentId/maintenance/:maintenanceId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { equipmentId, maintenanceId } = req.params;

  try {
    const result = await db.delete(equipmentMaintenance)
      .where(and(
        eq(equipmentMaintenance.id, maintenanceId),
        eq(equipmentMaintenance.equipmentId, equipmentId),
        eq(equipmentMaintenance.orgId, orgId)
      ))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to delete maintenance record',
      details: error.message
    });
  }
});

export default router;

import { Router, Response } from 'express';
import { db } from '../db';
import { equipment, zones } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { validateEquipmentInput, validateEquipmentAgainstZone } from '../validators/equipmentValidator';
import { trackChange } from '../services/changeTracker';

const router = Router({ mergeParams: true });
router.use(requireAuth);

// GET all equipment in a project
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const projectId = req.params.projectId;
  try {
    const list = await db.select()
      .from(equipment)
      .where(and(eq(equipment.projectId, projectId), eq(equipment.orgId, orgId)));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// GET equipment by ID
router.get('/:equipmentId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { equipmentId } = req.params;
  try {
    const item = await db.select()
      .from(equipment)
      .where(and(eq(equipment.id, equipmentId), eq(equipment.orgId, orgId)));

    if (!item.length) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(item[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// POST new equipment
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const projectId = req.params.projectId;
  const userId = req.user!.id;

  // Validate input
  const errors = validateEquipmentInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  try {
    const newEquipment = await db.insert(equipment).values({
      ...req.body,
      projectId,
      orgId,
      totalCapacityW: req.body.totalCapacityW ||
        (req.body.sensibleCapacityW ? parseFloat(req.body.sensibleCapacityW) + (parseFloat(req.body.latentCapacityW) || 0) : null),
    }).returning();

    res.status(201).json(newEquipment[0]);
  } catch (error: any) {
    res.status(400).json({
      error: 'Failed to create equipment',
      details: error.message
    });
  }
});

// PATCH update equipment
router.patch('/:equipmentId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const userId = req.user!.id;
  const { equipmentId, projectId } = req.params;

  // Validate input
  const errors = validateEquipmentInput({ ...req.body });
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  try {
    // Get original equipment
    const originalList = await db.select()
      .from(equipment)
      .where(and(eq(equipment.id, equipmentId), eq(equipment.orgId, orgId)));

    if (!originalList.length) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const original = originalList[0];

    // Calculate total capacity if sensible/latent provided
    const updateData = { ...req.body };
    if (updateData.sensibleCapacityW || updateData.latentCapacityW) {
      updateData.totalCapacityW = (parseFloat(updateData.sensibleCapacityW || original.sensibleCapacityW) || 0) +
        (parseFloat(updateData.latentCapacityW || original.latentCapacityW) || 0);
    }

    // Update equipment
    const updatedItem = await db.update(equipment)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(equipment.id, equipmentId))
      .returning();

    // Track changes asynchronously
    if (updatedItem.length > 0) {
      await trackChange(
        'equipment',
        equipmentId,
        original,
        updatedItem[0],
        orgId,
        userId,
        `Updated equipment: ${original.name}`
      );
    }

    res.json(updatedItem[0]);
  } catch (error: any) {
    res.status(400).json({
      error: 'Failed to update equipment',
      details: error.message
    });
  }
});

// DELETE equipment
router.delete('/:equipmentId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { equipmentId } = req.params;

  try {
    const result = await db.delete(equipment)
      .where(and(eq(equipment.id, equipmentId), eq(equipment.orgId, orgId)))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to delete equipment',
      details: error.message
    });
  }
});

export default router;

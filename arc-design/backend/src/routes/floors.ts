import { Router, Response } from 'express';
import { db } from '../db';
import { floors } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const projectId = req.params.projectId;
  try {
    const list = await db.select().from(floors).where(and(eq(floors.projectId, projectId), eq(floors.orgId, orgId)));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floors' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const projectId = req.params.projectId;
  try {
    const newFloor = await db.insert(floors).values({
      ...req.body,
      projectId,
      orgId,
    }).returning();
    res.status(201).json(newFloor[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:floorId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    const updated = await db.update(floors).set(req.body)
      .where(and(eq(floors.id, req.params.floorId), eq(floors.orgId, orgId)))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:floorId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    await db.delete(floors).where(and(eq(floors.id, req.params.floorId), eq(floors.orgId, orgId)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete floor' });
  }
});

export default router;

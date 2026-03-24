import { Router, Response } from 'express';
import { db } from '../db';
import { hvacSystems } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const projectId = req.params.projectId;
  try {
    const list = await db.select().from(hvacSystems).where(and(eq(hvacSystems.projectId, projectId), eq(hvacSystems.orgId, orgId)));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch systems' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const projectId = req.params.projectId;
  try {
    const newSystem = await db.insert(hvacSystems).values({
      ...req.body,
      projectId,
      orgId,
    }).returning();
    res.status(201).json(newSystem[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:systemId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    const updated = await db.update(hvacSystems).set(req.body)
      .where(and(eq(hvacSystems.id, req.params.systemId), eq(hvacSystems.orgId, orgId)))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:systemId', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    await db.delete(hvacSystems).where(and(eq(hvacSystems.id, req.params.systemId), eq(hvacSystems.orgId, orgId)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete system' });
  }
});

export default router;

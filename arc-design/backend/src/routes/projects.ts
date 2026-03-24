import { Router, Response } from 'express';
import { db } from '../db';
import { projects } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    const list = await db.select().from(projects).where(eq(projects.orgId, orgId));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const userId = req.user!.id;
  try {
    const newProject = await db.insert(projects).values({
      ...req.body,
      orgId,
      createdBy: userId,
    }).returning();
    res.status(201).json(newProject[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    const list = await db.select().from(projects).where(and(eq(projects.id, req.params.id), eq(projects.orgId, orgId)));
    if (list.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(list[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    const updated = await db.update(projects).set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(projects.id, req.params.id), eq(projects.orgId, orgId)))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  try {
    await db.delete(projects).where(and(eq(projects.id, req.params.id), eq(projects.orgId, orgId)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;

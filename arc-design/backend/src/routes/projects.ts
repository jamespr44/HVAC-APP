import { Router, Response } from 'express';
import { db } from '../db';
import { projects } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  getVersionHistory,
  getVersionDiff,
  rollbackToVersion,
  getZoneChangeHistory,
} from '../services/changeTracker';

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

// ── Version Control Endpoints ──

// GET version history for project
router.get('/:projectId/versions', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { projectId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

  try {
    const history = await getVersionHistory(projectId, orgId, limit);
    res.json(history);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET change history for a specific zone
router.get('/:projectId/zones/:zoneId/changes', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { zoneId } = req.params;

  try {
    const history = await getZoneChangeHistory(zoneId, orgId);
    res.json(history);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET diff between two versions
router.get('/:projectId/versions/:versionA/:versionB', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const { projectId, versionA, versionB } = req.params;

  try {
    const diff = await getVersionDiff(
      parseInt(versionA),
      parseInt(versionB),
      projectId,
      orgId
    );
    res.json(diff);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// POST rollback to version
router.post('/:projectId/versions/:versionNumber/rollback', async (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.org_id;
  const userId = req.user!.id;
  const { projectId, versionNumber } = req.params;

  try {
    await rollbackToVersion(parseInt(versionNumber), projectId, orgId, userId);
    res.json({ success: true, message: `Rolled back to version ${versionNumber}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const changeTracker_1 = require("../services/changeTracker");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    const orgId = req.user.org_id;
    try {
        const list = await db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.eq)(schema_1.projects.orgId, orgId));
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
router.post('/', async (req, res) => {
    const orgId = req.user.org_id;
    const userId = req.user.id;
    try {
        const newProject = await db_1.db.insert(schema_1.projects).values({
            ...req.body,
            orgId,
            createdBy: userId,
        }).returning();
        res.status(201).json(newProject[0]);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/:id', async (req, res) => {
    const orgId = req.user.org_id;
    try {
        const list = await db_1.db.select().from(schema_1.projects).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.id), (0, drizzle_orm_1.eq)(schema_1.projects.orgId, orgId)));
        if (list.length === 0)
            return res.status(404).json({ error: 'Project not found' });
        res.json(list[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});
router.put('/:id', async (req, res) => {
    const orgId = req.user.org_id;
    try {
        const updated = await db_1.db.update(schema_1.projects).set({ ...req.body, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.id), (0, drizzle_orm_1.eq)(schema_1.projects.orgId, orgId)))
            .returning();
        res.json(updated[0]);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/:id', async (req, res) => {
    const orgId = req.user.org_id;
    try {
        await db_1.db.delete(schema_1.projects).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.projects.id, req.params.id), (0, drizzle_orm_1.eq)(schema_1.projects.orgId, orgId)));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});
// ── Version Control Endpoints ──
// GET version history for project
router.get('/:projectId/versions', async (req, res) => {
    const orgId = req.user.org_id;
    const { projectId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    try {
        const history = await (0, changeTracker_1.getVersionHistory)(projectId, orgId, limit);
        res.json(history);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// GET change history for a specific zone
router.get('/:projectId/zones/:zoneId/changes', async (req, res) => {
    const orgId = req.user.org_id;
    const { zoneId } = req.params;
    try {
        const history = await (0, changeTracker_1.getZoneChangeHistory)(zoneId, orgId);
        res.json(history);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// GET diff between two versions
router.get('/:projectId/versions/:versionA/:versionB', async (req, res) => {
    const orgId = req.user.org_id;
    const { projectId, versionA, versionB } = req.params;
    try {
        const diff = await (0, changeTracker_1.getVersionDiff)(parseInt(versionA), parseInt(versionB), projectId, orgId);
        res.json(diff);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
});
// POST rollback to version
router.post('/:projectId/versions/:versionNumber/rollback', async (req, res) => {
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const { projectId, versionNumber } = req.params;
    try {
        await (0, changeTracker_1.rollbackToVersion)(parseInt(versionNumber), projectId, orgId, userId);
        res.json({ success: true, message: `Rolled back to version ${versionNumber}` });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;

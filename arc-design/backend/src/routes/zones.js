"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    const orgId = req.user.org_id;
    const projectId = req.params.projectId;
    try {
        const list = await db_1.db.select().from(schema_1.zones).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.zones.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.zones.orgId, orgId)));
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch zones' });
    }
});
router.post('/', async (req, res) => {
    const orgId = req.user.org_id;
    const projectId = req.params.projectId;
    try {
        const newZone = await db_1.db.insert(schema_1.zones).values({
            ...req.body,
            projectId,
            orgId,
        }).returning();
        res.status(201).json(newZone[0]);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.put('/:zoneId', async (req, res) => {
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const changeReason = req.body.changeReason || 'Update zone';
    delete req.body.changeReason;
    try {
        const updated = await db_1.db.transaction(async (tx) => {
            const originalList = await tx.select().from(schema_1.zones).where((0, drizzle_orm_1.eq)(schema_1.zones.id, req.params.zoneId));
            const original = originalList[0];
            if (!original)
                throw new Error('Zone not found');
            const changedFields = {};
            for (const key in req.body) {
                if (req.body[key] !== original[key]) {
                    changedFields[key] = { from: original[key], to: req.body[key] };
                }
            }
            const updatedZone = await tx.update(schema_1.zones).set({ ...req.body, updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.zones.id, req.params.zoneId), (0, drizzle_orm_1.eq)(schema_1.zones.orgId, orgId)))
                .returning();
            if (Object.keys(changedFields).length > 0) {
                await tx.insert(schema_1.zoneChanges).values({
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
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/:zoneId', async (req, res) => {
    const orgId = req.user.org_id;
    try {
        await db_1.db.delete(schema_1.zones).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.zones.id, req.params.zoneId), (0, drizzle_orm_1.eq)(schema_1.zones.orgId, orgId)));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete zone' });
    }
});
router.get('/:zoneId/changes', async (req, res) => {
    const orgId = req.user.org_id;
    try {
        const list = await db_1.db.select().from(schema_1.zoneChanges)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.zoneChanges.zoneId, req.params.zoneId), (0, drizzle_orm_1.eq)(schema_1.zoneChanges.orgId, orgId)))
            .orderBy(schema_1.zoneChanges.createdAt);
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch zone changes' });
    }
});
exports.default = router;

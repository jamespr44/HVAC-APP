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
        const list = await db_1.db.select().from(schema_1.hvacSystems).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.hvacSystems.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.hvacSystems.orgId, orgId)));
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch systems' });
    }
});
router.post('/', async (req, res) => {
    const orgId = req.user.org_id;
    const projectId = req.params.projectId;
    try {
        const newSystem = await db_1.db.insert(schema_1.hvacSystems).values({
            ...req.body,
            projectId,
            orgId,
        }).returning();
        res.status(201).json(newSystem[0]);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.put('/:systemId', async (req, res) => {
    const orgId = req.user.org_id;
    try {
        const updated = await db_1.db.update(schema_1.hvacSystems).set(req.body)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.hvacSystems.id, req.params.systemId), (0, drizzle_orm_1.eq)(schema_1.hvacSystems.orgId, orgId)))
            .returning();
        res.json(updated[0]);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/:systemId', async (req, res) => {
    const orgId = req.user.org_id;
    try {
        await db_1.db.delete(schema_1.hvacSystems).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.hvacSystems.id, req.params.systemId), (0, drizzle_orm_1.eq)(schema_1.hvacSystems.orgId, orgId)));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete system' });
    }
});
exports.default = router;

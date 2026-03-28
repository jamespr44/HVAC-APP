"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const equipmentValidator_1 = require("../validators/equipmentValidator");
const changeTracker_1 = require("../services/changeTracker");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.requireAuth);
// GET all equipment in a project
router.get('/', async (req, res) => {
    const orgId = req.user.org_id;
    const projectId = req.params.projectId;
    try {
        const list = await db_1.db.select()
            .from(schema_1.equipment)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.equipment.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.equipment.orgId, orgId)));
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch equipment' });
    }
});
// GET equipment by ID
router.get('/:equipmentId', async (req, res) => {
    const orgId = req.user.org_id;
    const { equipmentId } = req.params;
    try {
        const item = await db_1.db.select()
            .from(schema_1.equipment)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.equipment.id, equipmentId), (0, drizzle_orm_1.eq)(schema_1.equipment.orgId, orgId)));
        if (!item.length) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json(item[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch equipment' });
    }
});
// POST new equipment
router.post('/', async (req, res) => {
    const orgId = req.user.org_id;
    const projectId = req.params.projectId;
    const userId = req.user.id;
    // Validate input
    const errors = (0, equipmentValidator_1.validateEquipmentInput)(req.body);
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }
    try {
        const newEquipment = await db_1.db.insert(schema_1.equipment).values({
            ...req.body,
            projectId,
            orgId,
            totalCapacityW: req.body.totalCapacityW ||
                (req.body.sensibleCapacityW ? parseFloat(req.body.sensibleCapacityW) + (parseFloat(req.body.latentCapacityW) || 0) : null),
        }).returning();
        res.status(201).json(newEquipment[0]);
    }
    catch (error) {
        res.status(400).json({
            error: 'Failed to create equipment',
            details: error.message
        });
    }
});
// PATCH update equipment
router.patch('/:equipmentId', async (req, res) => {
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const { equipmentId, projectId } = req.params;
    // Validate input
    const errors = (0, equipmentValidator_1.validateEquipmentInput)({ ...req.body });
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }
    try {
        // Get original equipment
        const originalList = await db_1.db.select()
            .from(schema_1.equipment)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.equipment.id, equipmentId), (0, drizzle_orm_1.eq)(schema_1.equipment.orgId, orgId)));
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
        const updatedItem = await db_1.db.update(schema_1.equipment)
            .set({ ...updateData, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.equipment.id, equipmentId))
            .returning();
        // Track changes asynchronously
        if (updatedItem.length > 0) {
            await (0, changeTracker_1.trackChange)('equipment', equipmentId, original, updatedItem[0], orgId, userId, `Updated equipment: ${original.name}`);
        }
        res.json(updatedItem[0]);
    }
    catch (error) {
        res.status(400).json({
            error: 'Failed to update equipment',
            details: error.message
        });
    }
});
// DELETE equipment
router.delete('/:equipmentId', async (req, res) => {
    const orgId = req.user.org_id;
    const { equipmentId } = req.params;
    try {
        const result = await db_1.db.delete(schema_1.equipment)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.equipment.id, equipmentId), (0, drizzle_orm_1.eq)(schema_1.equipment.orgId, orgId)))
            .returning();
        if (!result.length) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to delete equipment',
            details: error.message
        });
    }
});
exports.default = router;

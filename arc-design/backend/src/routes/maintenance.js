"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.requireAuth);
// GET all maintenance records for an equipment item
router.get('/:equipmentId/maintenance', async (req, res) => {
    const orgId = req.user.org_id;
    const { equipmentId } = req.params;
    try {
        const list = await db_1.db.select()
            .from(schema_1.equipmentMaintenance)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.equipmentId, equipmentId), (0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.orgId, orgId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.equipmentMaintenance.nextDueDate));
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch maintenance records' });
    }
});
// POST create maintenance record
router.post('/:equipmentId/maintenance', async (req, res) => {
    const orgId = req.user.org_id;
    const { equipmentId } = req.params;
    const { maintenanceType, scheduledDate, frequencyDays, description } = req.body;
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
        const newRecord = await db_1.db.insert(schema_1.equipmentMaintenance).values({
            equipmentId,
            orgId,
            maintenanceType,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
            frequencyDays,
            description,
            nextDueDate,
        }).returning();
        res.status(201).json(newRecord[0]);
    }
    catch (error) {
        res.status(400).json({
            error: 'Failed to create maintenance record',
            details: error.message
        });
    }
});
// PATCH mark maintenance as completed
router.patch('/:equipmentId/maintenance/:maintenanceId/complete', async (req, res) => {
    const orgId = req.user.org_id;
    const { equipmentId, maintenanceId } = req.params;
    try {
        const original = await db_1.db.select()
            .from(schema_1.equipmentMaintenance)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.id, maintenanceId), (0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.equipmentId, equipmentId), (0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.orgId, orgId)));
        if (!original.length) {
            return res.status(404).json({ error: 'Maintenance record not found' });
        }
        const record = original[0];
        const now = new Date();
        const nextDue = new Date(now);
        nextDue.setDate(nextDue.getDate() + record.frequencyDays);
        const updated = await db_1.db.update(schema_1.equipmentMaintenance)
            .set({
            lastCompletedDate: now,
            nextDueDate: nextDue,
            updatedAt: now,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.id, maintenanceId))
            .returning();
        res.json(updated[0]);
    }
    catch (error) {
        res.status(400).json({
            error: 'Failed to complete maintenance record',
            details: error.message
        });
    }
});
// PATCH update maintenance record
router.patch('/:equipmentId/maintenance/:maintenanceId', async (req, res) => {
    const orgId = req.user.org_id;
    const { equipmentId, maintenanceId } = req.params;
    try {
        const updated = await db_1.db.update(schema_1.equipmentMaintenance)
            .set({
            ...req.body,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.id, maintenanceId), (0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.equipmentId, equipmentId), (0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.orgId, orgId)))
            .returning();
        if (!updated.length) {
            return res.status(404).json({ error: 'Maintenance record not found' });
        }
        res.json(updated[0]);
    }
    catch (error) {
        res.status(400).json({
            error: 'Failed to update maintenance record',
            details: error.message
        });
    }
});
// DELETE maintenance record
router.delete('/:equipmentId/maintenance/:maintenanceId', async (req, res) => {
    const orgId = req.user.org_id;
    const { equipmentId, maintenanceId } = req.params;
    try {
        const result = await db_1.db.delete(schema_1.equipmentMaintenance)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.id, maintenanceId), (0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.equipmentId, equipmentId), (0, drizzle_orm_1.eq)(schema_1.equipmentMaintenance.orgId, orgId)))
            .returning();
        if (!result.length) {
            return res.status(404).json({ error: 'Maintenance record not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to delete maintenance record',
            details: error.message
        });
    }
});
exports.default = router;

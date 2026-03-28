"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffObjects = diffObjects;
exports.generateChangeSummary = generateChangeSummary;
exports.trackChange = trackChange;
exports.getVersionHistory = getVersionHistory;
exports.getVersionDiff = getVersionDiff;
exports.rollbackToVersion = rollbackToVersion;
exports.getZoneChangeHistory = getZoneChangeHistory;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Calculate diff between old and new objects
 */
function diffObjects(old, new_) {
    const diff = {};
    // Check for changed fields
    const allKeys = new Set([...Object.keys(old || {}), ...Object.keys(new_ || {})]);
    for (const key of allKeys) {
        const oldValue = old?.[key];
        const newValue = new_?.[key];
        // Skip null/undefined comparison if both are falsy
        if (!oldValue && !newValue)
            continue;
        if (oldValue !== newValue) {
            diff[key] = { from: oldValue, to: newValue };
        }
    }
    return diff;
}
/**
 * Generate human-readable summary of changes
 */
function generateChangeSummary(changedFields, entityName = 'entity') {
    if (Object.keys(changedFields).length === 0) {
        return 'No changes';
    }
    const summaries = Object.entries(changedFields)
        .slice(0, 5) // Limit to first 5 changes for brevity
        .map(([field, { from, to }]) => {
        const fromStr = from === null ? 'empty' : from === undefined ? 'undefined' : String(from).slice(0, 20);
        const toStr = to === null ? 'empty' : to === undefined ? 'undefined' : String(to).slice(0, 20);
        return `${field}: ${fromStr}→${toStr}`;
    });
    const extra = Object.keys(changedFields).length - 5;
    if (extra > 0) {
        summaries.push(`+${extra} more`);
    }
    return summaries.join(', ');
}
/**
 * Track a change to a zone or equipment
 */
async function trackChange(entityType, entityId, oldData, newData, orgId, userId, reason) {
    const changedFields = diffObjects(oldData, newData);
    // Only log if there are actual changes
    if (Object.keys(changedFields).length === 0) {
        return;
    }
    if (entityType === 'zone') {
        await db_1.db.insert(schema_1.zoneChanges).values({
            zoneId: entityId,
            orgId,
            userId,
            changedFields,
            reason: reason || `Updated ${entityType}`,
        });
    }
    else if (entityType === 'equipment') {
        // For equipment, we still log to zoneChanges but with equipment context
        // Find the zone_id from equipment
        const equipItem = await db_1.db.select().from(schema_1.equipment).where((0, drizzle_orm_1.eq)(schema_1.equipment.id, entityId));
        if (equipItem.length > 0 && equipItem[0].zoneId) {
            await db_1.db.insert(schema_1.zoneChanges).values({
                zoneId: equipItem[0].zoneId,
                orgId,
                userId,
                changedFields: { ...changedFields, _equipmentId: { from: null, to: entityId } },
                reason: reason || `Updated equipment in zone`,
            });
        }
    }
}
/**
 * Get version history for a project
 */
async function getVersionHistory(projectId, orgId, limit = 100) {
    // Get all zone changes for all zones in the project
    const zonesInProject = await db_1.db.select().from(schema_1.zones)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.zones.projectId, projectId), (0, drizzle_orm_1.eq)(schema_1.zones.orgId, orgId)));
    const zoneIds = zonesInProject.map(z => z.id);
    if (zoneIds.length === 0) {
        return [];
    }
    const changes = await db_1.db.select().from(schema_1.zoneChanges)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.zoneChanges.orgId, orgId))))
        .orderBy(schema_1.zoneChanges.createdAt)
        .limit(limit);
    // Filter to only zones in this project
    return changes
        .filter(c => zoneIds.includes(c.zoneId))
        .reverse() // Most recent first
        .map((c, index) => ({
        ...c,
        versionNumber: limit - index, // Assign version numbers in reverse
    }));
}
/**
 * Get diff between two versions
 */
async function getVersionDiff(versionA, versionB, projectId, orgId) {
    const history = await getVersionHistory(projectId, orgId, 1000);
    const changeA = history.find(h => h.versionNumber === versionA);
    const changeB = history.find(h => h.versionNumber === versionB);
    if (!changeA || !changeB) {
        throw new Error('Version not found');
    }
    return {
        from: changeA,
        to: changeB,
        diff: {
            fieldsChanged: Object.keys(changeB.changedFields),
            changes: changeB.changedFields,
        },
    };
}
/**
 * Rollback to a previous version
 */
async function rollbackToVersion(versionNumber, projectId, orgId, userId) {
    const history = await getVersionHistory(projectId, orgId, 1000);
    const targetVersion = history.find(h => h.versionNumber === versionNumber);
    if (!targetVersion) {
        throw new Error('Version not found');
    }
    // Get the zone from the version
    const zone = await db_1.db.select().from(schema_1.zones)
        .where((0, drizzle_orm_1.eq)(schema_1.zones.id, targetVersion.zoneId));
    if (!zone.length) {
        throw new Error('Zone not found');
    }
    // Rollback: restore the "from" values of the change
    const rollbackData = {};
    for (const [field, { from }] of Object.entries(targetVersion.changedFields)) {
        if (!field.startsWith('_')) { // Ignore metadata fields
            rollbackData[field] = from;
        }
    }
    // Apply rollback
    const updated = await db_1.db.update(schema_1.zones)
        .set({ ...rollbackData, updatedAt: new Date() })
        .where((0, drizzle_orm_1.eq)(schema_1.zones.id, targetVersion.zoneId))
        .returning();
    // Log the rollback as a new change
    if (updated.length > 0) {
        await trackChange('zone', targetVersion.zoneId, zone[0], updated[0], orgId, userId, `Rolled back to version ${versionNumber}`);
    }
}
/**
 * Get all changes for a specific zone
 */
async function getZoneChangeHistory(zoneId, orgId) {
    const changes = await db_1.db.select().from(schema_1.zoneChanges)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.zoneChanges.zoneId, zoneId), (0, drizzle_orm_1.eq)(schema_1.zoneChanges.orgId, orgId)))
        .orderBy(schema_1.zoneChanges.createdAt);
    return changes.map((c, index) => ({
        ...c,
        versionNumber: index + 1,
    }));
}

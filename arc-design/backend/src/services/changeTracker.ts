import { db } from '../db';
import { zoneChanges, zones, equipment } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface ChangeRecord {
  zoneId?: string;
  equipmentId?: string;
  orgId: string;
  userId: string;
  changedFields: Record<string, { from: any; to: any }>;
  reason?: string;
}

/**
 * Calculate diff between old and new objects
 */
export function diffObjects(old: any, new_: any): Record<string, { from: any; to: any }> {
  const diff: Record<string, { from: any; to: any }> = {};

  // Check for changed fields
  const allKeys = new Set([...Object.keys(old || {}), ...Object.keys(new_ || {})]);

  for (const key of allKeys) {
    const oldValue = old?.[key];
    const newValue = new_?.[key];

    // Skip null/undefined comparison if both are falsy
    if (!oldValue && !newValue) continue;

    if (oldValue !== newValue) {
      diff[key] = { from: oldValue, to: newValue };
    }
  }

  return diff;
}

/**
 * Generate human-readable summary of changes
 */
export function generateChangeSummary(
  changedFields: Record<string, { from: any; to: any }>,
  entityName: string = 'entity'
): string {
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
export async function trackChange(
  entityType: 'zone' | 'equipment',
  entityId: string,
  oldData: any,
  newData: any,
  orgId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const changedFields = diffObjects(oldData, newData);

  // Only log if there are actual changes
  if (Object.keys(changedFields).length === 0) {
    return;
  }

  if (entityType === 'zone') {
    await db.insert(zoneChanges).values({
      zoneId: entityId,
      orgId,
      userId,
      changedFields,
      reason: reason || `Updated ${entityType}`,
    });
  } else if (entityType === 'equipment') {
    // For equipment, we still log to zoneChanges but with equipment context
    // Find the zone_id from equipment
    const equipItem = await db.select().from(equipment).where(eq(equipment.id, entityId));
    if (equipItem.length > 0 && equipItem[0].zoneId) {
      await db.insert(zoneChanges).values({
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
export async function getVersionHistory(projectId: string, orgId: string, limit: number = 100) {
  // Get all zone changes for all zones in the project
  const zonesInProject = await db.select().from(zones)
    .where(and(eq(zones.projectId, projectId), eq(zones.orgId, orgId)));

  const zoneIds = zonesInProject.map(z => z.id);

  if (zoneIds.length === 0) {
    return [];
  }

  const changes = await db.select().from(zoneChanges)
    .where(and(
      and(eq(zoneChanges.orgId, orgId)),
      // Drizzle requires filtering by individual zone IDs or using custom SQL
    ))
    .orderBy(zoneChanges.createdAt)
    .limit(limit);

  // Filter to only zones in this project
  return changes
    .filter(c => zoneIds.includes(c.zoneId!))
    .reverse() // Most recent first
    .map((c, index) => ({
      ...c,
      versionNumber: limit - index, // Assign version numbers in reverse
    }));
}

/**
 * Get diff between two versions
 */
export async function getVersionDiff(
  versionA: number,
  versionB: number,
  projectId: string,
  orgId: string
) {
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
      fieldsChanged: Object.keys(changeB.changedFields!),
      changes: changeB.changedFields,
    },
  };
}

/**
 * Rollback to a previous version
 */
export async function rollbackToVersion(
  versionNumber: number,
  projectId: string,
  orgId: string,
  userId: string
): Promise<void> {
  const history = await getVersionHistory(projectId, orgId, 1000);
  const targetVersion = history.find(h => h.versionNumber === versionNumber);

  if (!targetVersion) {
    throw new Error('Version not found');
  }

  // Get the zone from the version
  const zone = await db.select().from(zones)
    .where(eq(zones.id, targetVersion.zoneId!));

  if (!zone.length) {
    throw new Error('Zone not found');
  }

  // Rollback: restore the "from" values of the change
  const rollbackData: any = {};
  for (const [field, { from }] of Object.entries(targetVersion.changedFields!)) {
    if (!field.startsWith('_')) { // Ignore metadata fields
      rollbackData[field] = from;
    }
  }

  // Apply rollback
  const updated = await db.update(zones)
    .set({ ...rollbackData, updatedAt: new Date() })
    .where(eq(zones.id, targetVersion.zoneId!))
    .returning();

  // Log the rollback as a new change
  if (updated.length > 0) {
    await trackChange(
      'zone',
      targetVersion.zoneId!,
      zone[0],
      updated[0],
      orgId,
      userId,
      `Rolled back to version ${versionNumber}`
    );
  }
}

/**
 * Get all changes for a specific zone
 */
export async function getZoneChangeHistory(zoneId: string, orgId: string) {
  const changes = await db.select().from(zoneChanges)
    .where(and(eq(zoneChanges.zoneId, zoneId), eq(zoneChanges.orgId, orgId)))
    .orderBy(zoneChanges.createdAt);

  return changes.map((c, index) => ({
    ...c,
    versionNumber: index + 1,
  }));
}

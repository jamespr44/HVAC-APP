import { db } from '../db';
import { equipment } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface EquipmentLoad {
  equipmentId: string;
  name: string;
  equipmentType: string;
  sensibleW: number;
  latentW: number;
  totalW: number;
  rawSensibleW: number; // before diversification
  rawLatentW: number;
  diversityFactor: number;
  partLoadPercentage: number;
  usageProfile: string;
}

export interface ZoneEquipmentLoads {
  totalSensibleW: number;
  totalLatentW: number;
  equipmentBreakdown: EquipmentLoad[];
}

/**
 * Get usage profile multiplier based on profile type
 * @param profile 'peak' | 'average' | 'low' | 'custom'
 * @returns Multiplier (0-1)
 */
function getUsageProfileMultiplier(profile: string): number {
  switch (profile) {
    case 'peak': return 1.0;
    case 'average': return 0.8;
    case 'low': return 0.5;
    case 'custom': return 1.0; // user must set part load percentage
    default: return 1.0;
  }
}

/**
 * Calculate effective load for a single equipment considering diversification
 * Formula: Raw Load × Diversity Factor × (Part Load % / 100) × Usage Profile Multiplier
 */
export function calculateEquipmentEffectiveLoad(
  rawSensibleW: number,
  rawLatentW: number,
  diversityFactor: number,
  partLoadPercentage: number,
  usageProfile: string
): { sensibleW: number; latentW: number } {
  const diverseFactor = Math.max(0, Math.min(1, diversityFactor)); // Clamp 0-1
  const partLoadFactor = Math.max(0, Math.min(1, partLoadPercentage / 100)); // Clamp 0-1
  const profileMultiplier = getUsageProfileMultiplier(usageProfile);

  const effectiveMultiplier = diverseFactor * partLoadFactor * profileMultiplier;

  return {
    sensibleW: rawSensibleW * effectiveMultiplier,
    latentW: rawLatentW * effectiveMultiplier,
  };
}

/**
 * Get all equipment assigned to a zone and calculate their loads with diversification
 */
export async function getZoneEquipmentLoads(
  zoneId: string,
  orgId: string
): Promise<ZoneEquipmentLoads> {
  const equipmentList = await db
    .select()
    .from(equipment)
    .where(and(
      eq(equipment.zoneId, zoneId),
      eq(equipment.orgId, orgId),
      eq(equipment.inOperation, true)
    ));

  let totalSensibleW = 0;
  let totalLatentW = 0;
  const breakdown: EquipmentLoad[] = [];

  for (const eq of equipmentList) {
    const rawSensibleW = parseFloat(eq.sensibleCapacityW?.toString() || '0');
    const rawLatentW = parseFloat(eq.latentCapacityW?.toString() || '0');
    const diversityFactor = parseFloat(eq.diversityFactor?.toString() || '1.0');
    const partLoadPercentage = parseFloat(eq.partLoadPercentage?.toString() || '100');
    const usageProfile = eq.usageProfile || 'peak';

    const { sensibleW, latentW } = calculateEquipmentEffectiveLoad(
      rawSensibleW,
      rawLatentW,
      diversityFactor,
      partLoadPercentage,
      usageProfile
    );

    totalSensibleW += sensibleW;
    totalLatentW += latentW;

    breakdown.push({
      equipmentId: eq.id,
      name: eq.name,
      equipmentType: eq.equipmentType,
      sensibleW: sensibleW,
      latentW: latentW,
      totalW: sensibleW + latentW,
      rawSensibleW: rawSensibleW,
      rawLatentW: rawLatentW,
      diversityFactor: diversityFactor,
      partLoadPercentage: partLoadPercentage,
      usageProfile: usageProfile,
    });
  }

  return {
    totalSensibleW,
    totalLatentW,
    equipmentBreakdown: breakdown,
  };
}

/**
 * Validate diversification parameters
 */
export function validateDiversification(
  diversityFactor: number,
  partLoadPercentage: number,
  usageProfile: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (diversityFactor < 0 || diversityFactor > 1) {
    errors.push('Diversity factor must be between 0 and 1');
  }

  if (partLoadPercentage < 0 || partLoadPercentage > 100) {
    errors.push('Part load percentage must be between 0 and 100');
  }

  const validProfiles = ['peak', 'average', 'low', 'custom'];
  if (!validProfiles.includes(usageProfile)) {
    errors.push(`Usage profile must be one of: ${validProfiles.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

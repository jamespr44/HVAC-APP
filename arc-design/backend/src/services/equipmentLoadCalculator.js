"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateEquipmentEffectiveLoad = calculateEquipmentEffectiveLoad;
exports.getZoneEquipmentLoads = getZoneEquipmentLoads;
exports.validateDiversification = validateDiversification;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Get usage profile multiplier based on profile type
 * @param profile 'peak' | 'average' | 'low' | 'custom'
 * @returns Multiplier (0-1)
 */
function getUsageProfileMultiplier(profile) {
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
function calculateEquipmentEffectiveLoad(rawSensibleW, rawLatentW, diversityFactor, partLoadPercentage, usageProfile) {
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
async function getZoneEquipmentLoads(zoneId, orgId) {
    const equipmentList = await db_1.db
        .select()
        .from(schema_1.equipment)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.equipment.zoneId, zoneId), (0, drizzle_orm_1.eq)(schema_1.equipment.orgId, orgId), (0, drizzle_orm_1.eq)(schema_1.equipment.inOperation, true)));
    let totalSensibleW = 0;
    let totalLatentW = 0;
    const breakdown = [];
    for (const eq of equipmentList) {
        const rawSensibleW = parseFloat(eq.sensibleCapacityW?.toString() || '0');
        const rawLatentW = parseFloat(eq.latentCapacityW?.toString() || '0');
        const diversityFactor = parseFloat(eq.diversityFactor?.toString() || '1.0');
        const partLoadPercentage = parseFloat(eq.partLoadPercentage?.toString() || '100');
        const usageProfile = eq.usageProfile || 'peak';
        const { sensibleW, latentW } = calculateEquipmentEffectiveLoad(rawSensibleW, rawLatentW, diversityFactor, partLoadPercentage, usageProfile);
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
function validateDiversification(diversityFactor, partLoadPercentage, usageProfile) {
    const errors = [];
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEquipmentInput = validateEquipmentInput;
exports.validateEquipmentAgainstZone = validateEquipmentAgainstZone;
function validateEquipmentInput(input) {
    const errors = [];
    // Equipment type
    const validTypes = ['ahu', 'fcu', 'fan', 'pump'];
    if (!input.equipmentType || !validTypes.includes(input.equipmentType)) {
        errors.push({
            field: 'equipmentType',
            message: 'Equipment type must be one of: ahu, fcu, fan, pump'
        });
    }
    // Name
    if (!input.name || input.name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Equipment name is required' });
    }
    // Air flow validation (required for non-pump equipment)
    if (input.equipmentType !== 'pump') {
        if (input.airFlowRateM3Sec === undefined || input.airFlowRateM3Sec === null) {
            errors.push({
                field: 'airFlowRateM3Sec',
                message: 'Air flow rate (m³/s) is required for air-based equipment'
            });
        }
        else if (parseFloat(input.airFlowRateM3Sec) <= 0) {
            errors.push({
                field: 'airFlowRateM3Sec',
                message: 'Air flow rate must be positive'
            });
        }
    }
    // Capacity validation
    if (input.sensibleCapacityW !== undefined && input.sensibleCapacityW !== null) {
        if (parseFloat(input.sensibleCapacityW) < 0) {
            errors.push({
                field: 'sensibleCapacityW',
                message: 'Sensible capacity must be non-negative'
            });
        }
    }
    if (input.latentCapacityW !== undefined && input.latentCapacityW !== null) {
        if (parseFloat(input.latentCapacityW) < 0) {
            errors.push({
                field: 'latentCapacityW',
                message: 'Latent capacity must be non-negative'
            });
        }
    }
    // Total capacity validation
    if (input.totalCapacityW !== undefined && input.totalCapacityW !== null) {
        if (parseFloat(input.totalCapacityW) < 0) {
            errors.push({
                field: 'totalCapacityW',
                message: 'Total capacity must be non-negative'
            });
        }
    }
    // Power input validation
    if (input.powerInputW !== undefined && input.powerInputW !== null) {
        if (parseFloat(input.powerInputW) < 0) {
            errors.push({
                field: 'powerInputW',
                message: 'Power input must be non-negative'
            });
        }
    }
    // COP/Efficiency validation (0.5–10 range)
    if (input.copOrEfficiency !== undefined && input.copOrEfficiency !== null) {
        const value = parseFloat(input.copOrEfficiency);
        if (value < 0.5 || value > 10) {
            errors.push({
                field: 'copOrEfficiency',
                message: 'COP/Efficiency should be between 0.5 and 10'
            });
        }
    }
    // Refrigerant validation
    const validRefrigerants = ['R410A', 'R32', 'R454B', 'R290'];
    if (input.refrigerantType && !validRefrigerants.includes(input.refrigerantType)) {
        errors.push({
            field: 'refrigerantType',
            message: 'Unknown refrigerant type. Valid types: R410A, R32, R454B, R290'
        });
    }
    // Refrigerant charge validation (typical range 1.5–20 kg)
    if (input.refrigerantChargeKg !== undefined && input.refrigerantChargeKg !== null) {
        const charge = parseFloat(input.refrigerantChargeKg);
        if (charge < 0) {
            errors.push({
                field: 'refrigerantChargeKg',
                message: 'Refrigerant charge must be non-negative'
            });
        }
        if (charge > 0 && (charge < 0.5 || charge > 50)) {
            errors.push({
                field: 'refrigerantChargeKg',
                message: 'Refrigerant charge seems unrealistic (typical range 0.5–50 kg)'
            });
        }
    }
    // Pump-specific validation
    if (input.equipmentType === 'pump') {
        if (input.flowRateLPerMin !== undefined && input.flowRateLPerMin !== null) {
            if (parseFloat(input.flowRateLPerMin) <= 0) {
                errors.push({
                    field: 'flowRateLPerMin',
                    message: 'Flow rate must be positive'
                });
            }
        }
        if (input.headKpa !== undefined && input.headKpa !== null) {
            if (parseFloat(input.headKpa) < 0) {
                errors.push({
                    field: 'headKpa',
                    message: 'Head pressure must be non-negative'
                });
            }
        }
    }
    // Diversification validation
    if (input.diversityFactor !== undefined && input.diversityFactor !== null) {
        const factor = parseFloat(input.diversityFactor);
        if (factor < 0 || factor > 1) {
            errors.push({
                field: 'diversityFactor',
                message: 'Diversity factor must be between 0 and 1 (0-100% of equipment operating)',
                severity: 'error'
            });
        }
    }
    if (input.partLoadPercentage !== undefined && input.partLoadPercentage !== null) {
        const percentage = parseFloat(input.partLoadPercentage);
        if (percentage < 0 || percentage > 100) {
            errors.push({
                field: 'partLoadPercentage',
                message: 'Part load percentage must be between 0 and 100',
                severity: 'error'
            });
        }
    }
    if (input.usageProfile !== undefined && input.usageProfile !== null) {
        const validProfiles = ['peak', 'average', 'low', 'custom'];
        if (!validProfiles.includes(input.usageProfile)) {
            errors.push({
                field: 'usageProfile',
                message: `Usage profile must be one of: ${validProfiles.join(', ')}`,
                severity: 'error'
            });
        }
    }
    return errors;
}
function validateEquipmentAgainstZone(equipmentCapacityW, zoneTotalCoolingW) {
    if (!zoneTotalCoolingW || zoneTotalCoolingW <= 0) {
        return { warning: 'Zone cooling load not calculated. Cannot validate equipment capacity.' };
    }
    const minCapacityRequired = zoneTotalCoolingW * 0.95;
    const maxCapacityReasonable = zoneTotalCoolingW * 2;
    if (equipmentCapacityW < minCapacityRequired) {
        return {
            error: `Equipment undersized: ${(equipmentCapacityW / 1000).toFixed(1)} kW vs required ${(minCapacityRequired / 1000).toFixed(1)} kW`
        };
    }
    if (equipmentCapacityW > maxCapacityReasonable) {
        return {
            warning: `Equipment may be oversized: ${(equipmentCapacityW / 1000).toFixed(1)} kW vs zone load ${(zoneTotalCoolingW / 1000).toFixed(1)} kW`
        };
    }
    return {};
}

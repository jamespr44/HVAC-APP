"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateZoneInput = validateZoneInput;
exports.validateCalculationResults = validateCalculationResults;
function validateZoneInput(input) {
    const errors = [];
    // ── Geometry Validation ──
    // Area
    const area = input.areaM2 ? parseFloat(input.areaM2) : undefined;
    if (area !== undefined) {
        if (area <= 0) {
            errors.push({ field: 'areaM2', message: 'Area must be positive', severity: 'error' });
        }
        else if (area < 5) {
            errors.push({ field: 'areaM2', message: 'Area unusually small (< 5 m²)', severity: 'warning' });
        }
        else if (area > 50000) {
            errors.push({ field: 'areaM2', message: 'Area unreasonably large (> 50,000 m²)', severity: 'error' });
        }
    }
    // Height
    const height = input.heightM ? parseFloat(input.heightM) : undefined;
    if (height !== undefined) {
        if (height < 1) {
            errors.push({ field: 'heightM', message: 'Height should be at least 1m', severity: 'error' });
        }
        else if (height > 10) {
            errors.push({ field: 'heightM', message: 'Height should be less than 10m (very tall)', severity: 'warning' });
        }
    }
    // ── Envelope Validation ──
    // Wall U-value (typical: 0.1–2 W/m²K)
    const wallUValue = input.wallUValue ? parseFloat(input.wallUValue) : undefined;
    if (wallUValue !== undefined) {
        if (wallUValue < 0.1 || wallUValue > 3) {
            errors.push({
                field: 'wallUValue',
                message: 'Wall U-value out of typical range (0.1–3 W/m²K)',
                severity: 'warning'
            });
        }
    }
    // Window U-value
    const windowUValue = input.windowUValue ? parseFloat(input.windowUValue) : undefined;
    if (windowUValue !== undefined) {
        if (windowUValue < 0.5 || windowUValue > 6) {
            errors.push({
                field: 'windowUValue',
                message: 'Window U-value out of typical range (0.5–6 W/m²K)',
                severity: 'warning'
            });
        }
    }
    // Window SHGC (0–1)
    const shgc = input.windowSHGC ? parseFloat(input.windowSHGC) : undefined;
    if (shgc !== undefined) {
        if (shgc < 0 || shgc > 1) {
            errors.push({
                field: 'windowSHGC',
                message: 'SHGC must be 0–1',
                severity: 'error'
            });
        }
    }
    // Window shading factor
    const shadingFactor = input.windowShadingFactor ? parseFloat(input.windowShadingFactor) : undefined;
    if (shadingFactor !== undefined) {
        if (shadingFactor < 0 || shadingFactor > 1) {
            errors.push({
                field: 'windowShadingFactor',
                message: 'Shading factor must be 0–1',
                severity: 'error'
            });
        }
    }
    // Window area validation
    const windowArea = input.windowAreaM2 ? parseFloat(input.windowAreaM2) : undefined;
    if (windowArea !== undefined && area !== undefined) {
        if (windowArea > area) {
            errors.push({
                field: 'windowAreaM2',
                message: 'Window area cannot exceed floor area',
                severity: 'error'
            });
        }
        // Warn if glazing > 60% of wall area
        if (windowArea > area * 0.6) {
            errors.push({
                field: 'windowAreaM2',
                message: 'Window area very high (> 60% of floor)',
                severity: 'warning'
            });
        }
    }
    // Infiltration (Air Changes per Hour)
    const ach = input.infiltrationACH ? parseFloat(input.infiltrationACH) : undefined;
    if (ach !== undefined) {
        if (ach < 0.01) {
            errors.push({
                field: 'infiltrationACH',
                message: 'Infiltration rate unusually low (< 0.01 ACH)',
                severity: 'warning'
            });
        }
        else if (ach > 5) {
            errors.push({
                field: 'infiltrationACH',
                message: 'Infiltration rate very high (> 5 ACH). For sealed buildings, use 0.1–0.3',
                severity: 'warning'
            });
        }
    }
    // ── Occupancy Validation ──
    const occupants = input.occupants ? parseInt(input.occupants) : undefined;
    if (occupants !== undefined) {
        if (occupants < 0) {
            errors.push({ field: 'occupants', message: 'Occupant count cannot be negative', severity: 'error' });
        }
        if (area !== undefined && occupants > 0) {
            const densityPerM2 = occupants / area;
            if (densityPerM2 > 1) {
                errors.push({
                    field: 'occupants',
                    message: `Occupancy density very high (${densityPerM2.toFixed(1)} persons/m²). Typical: 0.05–0.2 persons/m²`,
                    severity: 'warning'
                });
            }
        }
    }
    // ── Internal Loads Validation ──
    // Equipment load
    const equipmentWm2 = input.equipmentWm2 ? parseFloat(input.equipmentWm2) : undefined;
    if (equipmentWm2 !== undefined) {
        if (equipmentWm2 < 0) {
            errors.push({
                field: 'equipmentWm2',
                message: 'Equipment load cannot be negative',
                severity: 'error'
            });
        }
        // Warn if very high
        if (equipmentWm2 > 500) {
            errors.push({
                field: 'equipmentWm2',
                message: 'Equipment load very high (> 500 W/m²). Verify input.',
                severity: 'warning'
            });
        }
    }
    // Lighting load
    const lightingWm2 = input.lightingWm2 ? parseFloat(input.lightingWm2) : undefined;
    if (lightingWm2 !== undefined) {
        if (lightingWm2 < 0) {
            errors.push({
                field: 'lightingWm2',
                message: 'Lighting load cannot be negative',
                severity: 'error'
            });
        }
        // Typical range: 5–20 W/m²
        if (lightingWm2 > 50) {
            errors.push({
                field: 'lightingWm2',
                message: 'Lighting load unusually high (> 50 W/m²)',
                severity: 'warning'
            });
        }
    }
    // ── Temperature & Humidity Validation ──
    const coolTemp = input.tempCoolingC ? parseFloat(input.tempCoolingC) : undefined;
    const heatTemp = input.tempHeatingC ? parseFloat(input.tempHeatingC) : undefined;
    const humidityMin = input.humidityMinPct ? parseFloat(input.humidityMinPct) : undefined;
    const humidityMax = input.humidityMaxPct ? parseFloat(input.humidityMaxPct) : undefined;
    // Temperature sanity
    if (coolTemp !== undefined) {
        if (coolTemp < 15 || coolTemp > 28) {
            errors.push({
                field: 'tempCoolingC',
                message: 'Cooling setpoint should be 15–28°C',
                severity: 'warning'
            });
        }
    }
    if (heatTemp !== undefined) {
        if (heatTemp < 15 || heatTemp > 24) {
            errors.push({
                field: 'tempHeatingC',
                message: 'Heating setpoint should be 15–24°C',
                severity: 'warning'
            });
        }
    }
    // Humidity range
    if (humidityMin !== undefined) {
        if (humidityMin < 10 || humidityMin > 80) {
            errors.push({
                field: 'humidityMinPct',
                message: 'Min humidity should be 10–80% RH',
                severity: 'warning'
            });
        }
    }
    if (humidityMax !== undefined) {
        if (humidityMax < 20 || humidityMax > 95) {
            errors.push({
                field: 'humidityMaxPct',
                message: 'Max humidity should be 20–95% RH',
                severity: 'warning'
            });
        }
    }
    // Min < Max
    if (humidityMin !== undefined && humidityMax !== undefined && humidityMin >= humidityMax) {
        errors.push({
            field: 'humidityMaxPct',
            message: 'Max humidity must be greater than min humidity',
            severity: 'error'
        });
    }
    return errors;
}
/**
 * Post-calculation sanity checks on heat load results
 */
function validateCalculationResults(results) {
    const errors = [];
    // Total load should be non-negative
    if (results.totalCoolingW !== undefined && results.totalCoolingW < 0) {
        errors.push({
            field: 'totalCoolingW',
            message: 'Total cooling load is negative. Check temperature inputs (cooling should have outdoor > indoor)',
            severity: 'error'
        });
    }
    // Sensible should be non-negative
    if (results.totalSensibleW !== undefined && results.totalSensibleW < 0) {
        errors.push({
            field: 'totalSensibleW',
            message: 'Sensible load is negative. Check envelope and temperature inputs',
            severity: 'error'
        });
    }
    // Latent should be non-negative
    if (results.totalLatentW !== undefined && results.totalLatentW < 0) {
        errors.push({
            field: 'totalLatentW',
            message: 'Latent load is negative. Check humidity inputs',
            severity: 'error'
        });
    }
    // Transmission shouldn't dominate too much
    if (results.transmissionW !== undefined &&
        results.totalCoolingW !== undefined &&
        results.totalCoolingW > 0) {
        const transmissionPct = (results.transmissionW / results.totalCoolingW) * 100;
        if (transmissionPct > 80) {
            errors.push({
                field: 'totalCoolingW',
                message: `Transmission load dominates (${transmissionPct.toFixed(0)}% of total). Verify wall/window properties and outdoor temperature.`,
                severity: 'warning'
            });
        }
    }
    return errors;
}

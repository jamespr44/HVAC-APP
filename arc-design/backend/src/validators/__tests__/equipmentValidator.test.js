"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const equipmentValidator_1 = require("../equipmentValidator");
describe('Equipment Input Validation', () => {
    describe('Equipment type validation', () => {
        it('accepts valid equipment types', () => {
            const validTypes = ['ahu', 'fcu', 'fan', 'pump'];
            validTypes.forEach(type => {
                const errors = (0, equipmentValidator_1.validateEquipmentInput)({ equipmentType: type, name: 'Test' });
                expect(errors.filter(e => e.field === 'equipmentType')).toHaveLength(0);
            });
        });
        it('rejects invalid equipment type', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({ equipmentType: 'heater', name: 'Test' });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'equipmentType'
            }));
        });
        it('rejects missing equipment type', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({ name: 'Test' });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'equipmentType'
            }));
        });
    });
    describe('Name validation', () => {
        it('rejects empty name', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({ equipmentType: 'ahu', name: '' });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'name'
            }));
        });
        it('rejects missing name', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({ equipmentType: 'ahu' });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'name'
            }));
        });
        it('accepts valid name', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({ equipmentType: 'ahu', name: 'Main AHU' });
            expect(errors.filter(e => e.field === 'name')).toHaveLength(0);
        });
    });
    describe('Air flow validation', () => {
        it('requires air flow for AHU', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01'
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'airFlowRateM3Sec'
            }));
        });
        it('requires air flow for FCU', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'fcu',
                name: 'FCU-01'
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'airFlowRateM3Sec'
            }));
        });
        it('rejects negative air flow', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: -0.5
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'airFlowRateM3Sec'
            }));
        });
        it('rejects zero air flow', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 0
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'airFlowRateM3Sec'
            }));
        });
        it('accepts positive air flow', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5
            });
            expect(errors.filter(e => e.field === 'airFlowRateM3Sec')).toHaveLength(0);
        });
        it('does not require air flow for pump', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'pump',
                name: 'Pump-01'
            });
            expect(errors.filter(e => e.field === 'airFlowRateM3Sec')).toHaveLength(0);
        });
    });
    describe('Capacity validation', () => {
        it('rejects negative sensible capacity', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                sensibleCapacityW: -5000
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'sensibleCapacityW'
            }));
        });
        it('rejects negative latent capacity', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                latentCapacityW: -2000
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'latentCapacityW'
            }));
        });
        it('accepts zero capacity', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                sensibleCapacityW: 0
            });
            expect(errors.filter(e => e.field === 'sensibleCapacityW')).toHaveLength(0);
        });
        it('accepts positive capacity', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                sensibleCapacityW: 10000,
                latentCapacityW: 4000
            });
            expect(errors.filter(e => e.field === 'sensibleCapacityW' || e.field === 'latentCapacityW')).toHaveLength(0);
        });
    });
    describe('COP/Efficiency validation', () => {
        it('rejects COP < 0.5', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                copOrEfficiency: 0.3
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'copOrEfficiency'
            }));
        });
        it('rejects COP > 10', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                copOrEfficiency: 15
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'copOrEfficiency'
            }));
        });
        it('accepts COP in range 0.5-10', () => {
            const validCOPs = [0.5, 2.5, 5, 8, 10];
            validCOPs.forEach(cop => {
                const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                    equipmentType: 'ahu',
                    name: 'AHU-01',
                    airFlowRateM3Sec: 2.5,
                    copOrEfficiency: cop
                });
                expect(errors.filter(e => e.field === 'copOrEfficiency')).toHaveLength(0);
            });
        });
    });
    describe('Refrigerant validation', () => {
        const validRefrigerants = ['R410A', 'R32', 'R454B', 'R290'];
        it('accepts valid refrigerant types', () => {
            validRefrigerants.forEach(type => {
                const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                    equipmentType: 'ahu',
                    name: 'AHU-01',
                    airFlowRateM3Sec: 2.5,
                    refrigerantType: type
                });
                expect(errors.filter(e => e.field === 'refrigerantType')).toHaveLength(0);
            });
        });
        it('rejects invalid refrigerant type', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                refrigerantType: 'R22'
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'refrigerantType'
            }));
        });
        it('warns on unrealistic refrigerant charge (too low)', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                refrigerantType: 'R410A',
                refrigerantChargeKg: 0.1
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'refrigerantChargeKg'
            }));
        });
        it('warns on unrealistic refrigerant charge (too high)', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                refrigerantType: 'R410A',
                refrigerantChargeKg: 100
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'refrigerantChargeKg'
            }));
        });
        it('accepts realistic refrigerant charge', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'ahu',
                name: 'AHU-01',
                airFlowRateM3Sec: 2.5,
                refrigerantType: 'R410A',
                refrigerantChargeKg: 5
            });
            expect(errors.filter(e => e.field === 'refrigerantChargeKg')).toHaveLength(0);
        });
    });
    describe('Pump-specific validation', () => {
        it('rejects negative flow rate', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'pump',
                name: 'Pump-01',
                flowRateLPerMin: -50
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'flowRateLPerMin'
            }));
        });
        it('rejects negative head', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'pump',
                name: 'Pump-01',
                flowRateLPerMin: 100,
                headKpa: -10
            });
            expect(errors).toContainEqual(expect.objectContaining({
                field: 'headKpa'
            }));
        });
        it('accepts valid pump specs', () => {
            const errors = (0, equipmentValidator_1.validateEquipmentInput)({
                equipmentType: 'pump',
                name: 'Pump-01',
                flowRateLPerMin: 100,
                headKpa: 50
            });
            expect(errors.filter(e => e.field === 'flowRateLPerMin' || e.field === 'headKpa')).toHaveLength(0);
        });
    });
});
describe('Equipment vs Zone Validation', () => {
    it('returns error when equipment undersized (< 0.95 × zone load)', () => {
        const result = (0, equipmentValidator_1.validateEquipmentAgainstZone)(4000, 5000); // 4000 < 0.95*5000
        expect(result.error).toBeDefined();
        expect(result.error).toContain('undersized');
    });
    it('returns warning when equipment oversized (> 2 × zone load)', () => {
        const result = (0, equipmentValidator_1.validateEquipmentAgainstZone)(12000, 5000); // 12000 > 2*5000
        expect(result.warning).toBeDefined();
        expect(result.warning).toContain('oversized');
    });
    it('returns no warning when equipment is properly sized', () => {
        const result = (0, equipmentValidator_1.validateEquipmentAgainstZone)(5500, 5000); // 5500 is between 0.95*5000 and 2*5000
        expect(result.error).toBeUndefined();
        expect(result.warning).toBeUndefined();
    });
    it('returns warning when zone load is not calculated', () => {
        const result = (0, equipmentValidator_1.validateEquipmentAgainstZone)(5000, 0);
        expect(result.warning).toBeDefined();
    });
});
describe('Common Equipment Configurations', () => {
    it('validates office AHU (2.5 m³/s, 10 kW cooling)', () => {
        const errors = (0, equipmentValidator_1.validateEquipmentInput)({
            equipmentType: 'ahu',
            name: 'AHU-Office-01',
            model: 'VAV-2500',
            manufacturer: 'HVAC Corp',
            airFlowRateM3Sec: 2.5,
            sensibleCapacityW: 7000,
            latentCapacityW: 3000,
            totalCapacityW: 10000,
            powerInputW: 2500,
            copOrEfficiency: 4.0,
            refrigerantType: 'R410A',
            refrigerantChargeKg: 3
        });
        expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });
    it('validates server room FCU (0.5 m³/s, 5 kW cooling)', () => {
        const errors = (0, equipmentValidator_1.validateEquipmentInput)({
            equipmentType: 'fcu',
            name: 'FCU-Server-01',
            model: 'FCU-500',
            manufacturer: 'HVAC Corp',
            airFlowRateM3Sec: 0.5,
            sensibleCapacityW: 4500,
            latentCapacityW: 500,
            totalCapacityW: 5000,
            powerInputW: 800,
            refrigerantType: 'R32',
            refrigerantChargeKg: 0.8
        });
        expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });
    it('validates circulating pump (100 L/min, 50 kPa)', () => {
        const errors = (0, equipmentValidator_1.validateEquipmentInput)({
            equipmentType: 'pump',
            name: 'Pump-Circulation',
            model: 'CP-100',
            manufacturer: 'Pump Co',
            flowRateLPerMin: 100,
            headKpa: 50,
            powerInputW: 500,
            thermalFluidType: 'water'
        });
        expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
    });
});

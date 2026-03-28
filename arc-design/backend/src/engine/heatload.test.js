"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const heatload_1 = require("./heatload");
describe('Heat Load Calculation Engine (HAP-based)', () => {
    const climate = {
        summerDbC: 37,
        summerWbC: 25,
        winterDbC: 6,
        dailyRangeC: 7.2,
        altitudeM: 6,
    };
    const baseZone = {
        roomDesc: 'Test Office',
        roomCode: 'L1-01',
        ahuTag: 'AHU-01',
        subZoneTag: 'HWC-L01-01',
        areaM2: 100,
        heightM: 3.0,
        winterRoomTempC: 21,
        summerRoomTempC: 23,
        facadeOrientation: 'N',
        facadeType: 'FT01',
        facadeWidthM: 10,
        windowWidthM: 8,
        windowHeightM: 2.4,
        hasRoof: false,
        exposedRoofAreaM2: 0,
        roofType: 'roof_other',
        occupants: 10,
        oaMethod: 'general',
        lightingWm2: 6,
        equipmentWm2: 15,
        equipmentPointLoadW: 0,
        infiltrationLs: 0,
        saTemperatureC: 12,
        achRequiredSupply: 0,
        achRequiredOA: 0,
        isHWCReheatZone: true,
    };
    it('uses sensible heat factor of 1.213 for all calculations', () => {
        const result = (0, heatload_1.calculateZoneLoads)(baseZone, climate);
        // SA = totalSensible / (1.213 * (23 - 12))
        const expectedSaForLoad = result.totalSensibleW / (1.213 * (23 - 12));
        expect(result.saForLoadLs).toBeCloseTo(expectedSaForLoad, 1);
    });
    it('calculates glass solar using HAP W/m² lookup for N + FT01', () => {
        const result = (0, heatload_1.calculateZoneLoads)(baseZone, climate);
        // N + FT01 => 103 W/m² glass, windowArea = 8 * 2.4 = 19.2 m²
        expect(result.glassSolarW).toBeCloseTo(103 * 19.2, 1);
    });
    it('calculates wall transmission using HAP W/m² lookup', () => {
        const result = (0, heatload_1.calculateZoneLoads)(baseZone, climate);
        // totalFacade = 10 * 3.0 = 30 m², window = 19.2 m², solidWall = 10.8 m²
        // N + FT01 wall => 19 W/m²
        expect(result.wallTransmissionW).toBeCloseTo(19 * 10.8, 1);
    });
    it('uses temperature-indexed occupant loads at 23°C', () => {
        const result = (0, heatload_1.calculateZoneLoads)(baseZone, climate);
        // At 23°C: sensible = 74 W/person, latent = 56 W/person
        expect(result.peopleSensibleW).toBeCloseTo(74 * 10, 1);
        expect(result.peopleLatentW).toBeCloseTo(56 * 10, 1);
    });
    it('rounds SA final to nearest 5 L/s (CEILING.MATH)', () => {
        const result = (0, heatload_1.calculateZoneLoads)(baseZone, climate);
        expect(result.saFinalLs % 5).toBe(0);
        expect(result.saFinalLs).toBeGreaterThanOrEqual(result.saForLoadLs);
    });
    it('calculates OA using AS1668.2 general rate of 7.5 L/s/person', () => {
        const result = (0, heatload_1.calculateZoneLoads)(baseZone, climate);
        expect(result.oaForOccupancyLs).toBe(7.5 * 10); // 75 L/s
    });
    it('calculates OA using green star rate of 11.25 L/s/person', () => {
        const greenZone = { ...baseZone, oaMethod: 'green' };
        const result = (0, heatload_1.calculateZoneLoads)(greenZone, climate);
        expect(result.oaForOccupancyLs).toBe(11.25 * 10); // 112.5 L/s
    });
    it('uses max(pointLoad, W/m² × area) for equipment', () => {
        const zoneWithPoint = { ...baseZone, equipmentPointLoadW: 5000 };
        const result = (0, heatload_1.calculateZoneLoads)(zoneWithPoint, climate);
        // max(5000, 15 * 100) = max(5000, 1500) = 5000
        expect(result.equipmentW).toBe(5000);
    });
    it('calculates infiltration load correctly', () => {
        const zoneWithInfil = { ...baseZone, infiltrationLs: 10 };
        const result = (0, heatload_1.calculateZoneLoads)(zoneWithInfil, climate);
        // (37 - 23) * 1.213 * 10 = 169.82
        expect(result.infiltrationW).toBeCloseTo(14 * 1.213 * 10, 1);
    });
    it('calculates heating using winter HAP transmission loads', () => {
        const result = (0, heatload_1.calculateZoneLoads)(baseZone, climate);
        // N + FT01 winter: glass = 48 W/m², wall = 15 W/m²
        expect(result.heatingGlassW).toBeCloseTo(48 * 19.2, 1);
        expect(result.heatingFacadeW).toBeCloseTo(15 * 10.8, 1);
    });
    it('sets heating SA-T = room_T for HWC reheat zones', () => {
        const result = (0, heatload_1.calculateZoneLoads)(baseZone, climate);
        expect(result.heatingRequiredSATempC).toBe(21); // winterRoomTempC
    });
    it('calculates heating SA-T with reheat offset for non-HWC zones', () => {
        const nonHwc = { ...baseZone, isHWCReheatZone: false };
        const result = (0, heatload_1.calculateZoneLoads)(nonHwc, climate);
        // SA-T = room_T + heating / (1.213 * saFinal)
        const expected = 21 + result.heatingTotalW / (1.213 * result.saFinalLs);
        expect(result.heatingRequiredSATempC).toBeCloseTo(expected, 1);
    });
    it('handles partition facade correctly', () => {
        const partitionZone = {
            ...baseZone,
            facadeOrientation: 'Partition',
            facadeType: 'Partition',
            facadeWidthM: 5,
            windowWidthM: 0,
            windowHeightM: 0,
        };
        const result = (0, heatload_1.calculateZoneLoads)(partitionZone, climate);
        // (37 - 23) * 5 * 3.0 * 1.0 = 210 W
        expect(result.glassSolarW).toBe(0);
        expect(result.wallTransmissionW).toBeCloseTo((37 - 23) * 15 * 1.0, 1);
    });
    it('handles internal zone with no facade loads', () => {
        const internalZone = {
            ...baseZone,
            facadeOrientation: 'Internal',
            facadeWidthM: 0,
            windowWidthM: 0,
            windowHeightM: 0,
        };
        const result = (0, heatload_1.calculateZoneLoads)(internalZone, climate);
        expect(result.glassSolarW).toBe(0);
        expect(result.wallTransmissionW).toBe(0);
    });
    it('calculates SA-T required and room temp result', () => {
        const result = (0, heatload_1.calculateZoneLoads)(baseZone, climate);
        // SA-T required = room_T - totalSensible / (1.213 * saFinal)
        const expectedSaT = 23 - result.totalSensibleW / (1.213 * result.saFinalLs);
        expect(result.saTempRequired).toBeCloseTo(expectedSaT, 1);
        // Room T result = totalSensible / (1.213 * saFinal) + SA_T
        const expectedRoomT = result.totalSensibleW / (1.213 * result.saFinalLs) + 12;
        expect(result.roomTempIfSaTRemains).toBeCloseTo(expectedRoomT, 1);
    });
    it('respects ACH-based supply when higher than load-based', () => {
        const labZone = { ...baseZone, achRequiredSupply: 15 };
        const result = (0, heatload_1.calculateZoneLoads)(labZone, climate);
        // 15 ACH * 300 m³ / 3.6 = 1250 L/s
        const achLs = (15 * 300) / 3.6;
        expect(result.saFinalLs).toBeGreaterThanOrEqual(achLs);
    });
});
describe('Zoning Check', () => {
    it('identifies good zoning when temp range < 2°C', () => {
        const zones = [
            { totalSensibleW: 2000, saFinalLs: 150 },
            { totalSensibleW: 2100, saFinalLs: 155 },
        ];
        const result = (0, heatload_1.checkZoning)(zones, 12);
        expect(result.status).toBe('Good');
        expect(result.tempRange).toBeLessThan(2);
    });
    it('identifies poor zoning when temp range >= 4°C', () => {
        const zones = [
            { totalSensibleW: 1000, saFinalLs: 100 },
            { totalSensibleW: 8000, saFinalLs: 100 },
        ];
        const result = (0, heatload_1.checkZoning)(zones, 12);
        expect(result.status).toBe('Poor');
        expect(result.tempRange).toBeGreaterThanOrEqual(4);
    });
});

import { calculateZoneLoads, ZoneInputs, ClimateInputs } from './heatload';

describe('Heat Load Calculation Engine', () => {
  const climate: ClimateInputs = {
    summerDbC: 33.4,
    summerWbC: 24.4,
    winterDbC: 8.0,
    dailyRangeC: 7.2,
    altitudeM: 6,
  };

  const baseZone: ZoneInputs = {
    areaM2: 100,
    heightM: 3.0,
    orientation: 'N',
    hasExternalWall: true,
    hasRoof: true,
    glazingPct: 20,
    wallUValue: 0.35,
    glassUValue: 2.8,
    glassSHGC: 0.4,
    roofUValue: 0.2,
    occupants: 10,
    occupantActivity: 'seated',
    lightingWm2: 12,
    equipmentWm2: 15,
    tempCoolingC: 24,
    tempHeatingC: 20,
    humidityMaxPct: 60,
    oaMethod: 'ashrae_62',
    oaLsPerPerson: 10,
    oaLsPerM2: 0.5,
    is100PctOA: false
  };

  it('calculates loads for a typical office zone', () => {
    const result = calculateZoneLoads(baseZone, climate);
    
    expect(result.occupantSensibleW).toBe(700);
    expect(result.occupantLatentW).toBe(450);
    expect(result.lightingW).toBe(1200);
    expect(result.equipmentW).toBe(1500);

    // Assert that calculated cooling totals sum correctly
    expect(result.totalSensibleW).toBeGreaterThan(0);
    expect(result.totalLatentW).toBeGreaterThan(0);
    expect(result.totalCoolingW).toBe(result.totalSensibleW + result.totalLatentW);
    
    // Test that OA was calculated correctly
    expect(result.oaLs).toBe(100 + 50); // 10 pax * 10 L/s/pax + 100 m2 * 0.5 L/s/m2 = 150 L/s
    expect(result.supplyLs).toBeGreaterThanOrEqual(150);
    expect(result.wPerM2).toBe(Math.round(result.totalSensibleW / 100));
  });
});

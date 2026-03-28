import { validateZoneInput, validateCalculationResults } from '../zoneValidator';

describe('Zone Input Validation', () => {
  describe('Area validation', () => {
    it('rejects negative area', () => {
      const errors = validateZoneInput({ areaM2: -10 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'areaM2',
        severity: 'error'
      }));
    });

    it('rejects zero area', () => {
      const errors = validateZoneInput({ areaM2: 0 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'areaM2',
        severity: 'error'
      }));
    });

    it('warns on very small area', () => {
      const errors = validateZoneInput({ areaM2: 2 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'areaM2',
        severity: 'warning'
      }));
    });

    it('rejects unreasonably large area', () => {
      const errors = validateZoneInput({ areaM2: 60000 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'areaM2',
        severity: 'error'
      }));
    });

    it('accepts normal area', () => {
      const errors = validateZoneInput({ areaM2: 200 });
      expect(errors.filter(e => e.field === 'areaM2')).toHaveLength(0);
    });
  });

  describe('Height validation', () => {
    it('rejects height < 1m', () => {
      const errors = validateZoneInput({ heightM: 0.5 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'heightM',
        severity: 'error'
      }));
    });

    it('warns on very tall height', () => {
      const errors = validateZoneInput({ heightM: 12 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'heightM',
        severity: 'warning'
      }));
    });

    it('accepts normal height', () => {
      const errors = validateZoneInput({ heightM: 3 });
      expect(errors.filter(e => e.field === 'heightM')).toHaveLength(0);
    });
  });

  describe('Wall U-value validation', () => {
    it('warns on out-of-range U-value', () => {
      const errors = validateZoneInput({ wallUValue: 5 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'wallUValue',
        severity: 'warning'
      }));
    });

    it('accepts normal U-value', () => {
      const errors = validateZoneInput({ wallUValue: 0.4 });
      expect(errors.filter(e => e.field === 'wallUValue')).toHaveLength(0);
    });
  });

  describe('Window SHGC validation', () => {
    it('rejects SHGC < 0', () => {
      const errors = validateZoneInput({ windowSHGC: -0.1 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'windowSHGC',
        severity: 'error'
      }));
    });

    it('rejects SHGC > 1', () => {
      const errors = validateZoneInput({ windowSHGC: 1.5 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'windowSHGC',
        severity: 'error'
      }));
    });

    it('accepts normal SHGC', () => {
      const errors = validateZoneInput({ windowSHGC: 0.6 });
      expect(errors.filter(e => e.field === 'windowSHGC')).toHaveLength(0);
    });
  });

  describe('Window area validation', () => {
    it('rejects window area > floor area', () => {
      const errors = validateZoneInput({ areaM2: 100, windowAreaM2: 150 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'windowAreaM2',
        severity: 'error'
      }));
    });

    it('warns when window area > 60% of floor', () => {
      const errors = validateZoneInput({ areaM2: 100, windowAreaM2: 70 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'windowAreaM2',
        severity: 'warning'
      }));
    });

    it('accepts normal window area', () => {
      const errors = validateZoneInput({ areaM2: 100, windowAreaM2: 20 });
      expect(errors.filter(e => e.field === 'windowAreaM2')).toHaveLength(0);
    });
  });

  describe('Occupancy validation', () => {
    it('rejects negative occupancy', () => {
      const errors = validateZoneInput({ occupants: -5 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'occupants',
        severity: 'error'
      }));
    });

    it('warns on high occupancy density', () => {
      const errors = validateZoneInput({ areaM2: 100, occupants: 150 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'occupants',
        severity: 'warning'
      }));
    });

    it('accepts normal occupancy', () => {
      const errors = validateZoneInput({ areaM2: 100, occupants: 10 });
      expect(errors.filter(e => e.field === 'occupants')).toHaveLength(0);
    });
  });

  describe('Equipment load validation', () => {
    it('rejects negative equipment load', () => {
      const errors = validateZoneInput({ equipmentWm2: -10 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'equipmentWm2',
        severity: 'error'
      }));
    });

    it('warns on very high equipment load', () => {
      const errors = validateZoneInput({ equipmentWm2: 600 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'equipmentWm2',
        severity: 'warning'
      }));
    });

    it('accepts normal equipment load', () => {
      const errors = validateZoneInput({ equipmentWm2: 20 });
      expect(errors.filter(e => e.field === 'equipmentWm2')).toHaveLength(0);
    });
  });

  describe('Humidity validation', () => {
    it('rejects max < min humidity', () => {
      const errors = validateZoneInput({ humidityMinPct: 60, humidityMaxPct: 40 });
      expect(errors).toContainEqual(expect.objectContaining({
        field: 'humidityMaxPct',
        severity: 'error'
      }));
    });

    it('accepts normal humidity range', () => {
      const errors = validateZoneInput({ humidityMinPct: 40, humidityMaxPct: 60 });
      expect(errors.filter(e => e.field === 'humidityMaxPct' || e.field === 'humidityMinPct')).toHaveLength(0);
    });
  });
});

describe('Calculation Results Validation', () => {
  it('rejects negative total cooling load', () => {
    const errors = validateCalculationResults({ totalCoolingW: -1000 });
    expect(errors).toContainEqual(expect.objectContaining({
      field: 'totalCoolingW',
      severity: 'error'
    }));
  });

  it('rejects negative sensible load', () => {
    const errors = validateCalculationResults({ totalSensibleW: -500 });
    expect(errors).toContainEqual(expect.objectContaining({
      field: 'totalSensibleW',
      severity: 'error'
    }));
  });

  it('rejects negative latent load', () => {
    const errors = validateCalculationResults({ totalLatentW: -200 });
    expect(errors).toContainEqual(expect.objectContaining({
      field: 'totalLatentW',
      severity: 'error'
    }));
  });

  it('warns when transmission dominates (> 80% of total)', () => {
    const errors = validateCalculationResults({
      totalCoolingW: 1000,
      transmissionW: 850 // 85%
    });
    expect(errors).toContainEqual(expect.objectContaining({
      field: 'totalCoolingW',
      severity: 'warning'
    }));
  });

  it('accepts normal calculation results', () => {
    const errors = validateCalculationResults({
      totalCoolingW: 5000,
      totalSensibleW: 3500,
      totalLatentW: 1500,
      transmissionW: 1000
    });
    expect(errors).toHaveLength(0);
  });
});

describe('Synthetic Project Scenarios', () => {
  it('validates office zone input (200 m², 8 occupants)', () => {
    const officeInput = {
      areaM2: 200,
      heightM: 3,
      orientation: 'south',
      wallUValue: 0.4,
      windowAreaM2: 40,
      windowUValue: 2.8,
      windowSHGC: 0.6,
      windowShadingFactor: 0.5,
      infiltrationACH: 0.3,
      occupants: 8,
      equipmentWm2: 15,
      lightingWm2: 10,
      tempCoolingC: 22,
      tempHeatingC: 21,
      humidityMinPct: 40,
      humidityMaxPct: 60,
    };

    const errors = validateZoneInput(officeInput);
    // Should have no errors
    expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
  });

  it('validates server room input (100 m², high equipment)', () => {
    const serverRoomInput = {
      areaM2: 100,
      heightM: 2.7,
      orientation: 'Internal',
      wallUValue: 0.35,
      windowAreaM2: 0,
      windowUValue: 2.8,
      infiltrationACH: 0.5,
      occupants: 2,
      equipmentWm2: 200,
      lightingWm2: 20,
      tempCoolingC: 21,
      humidityMinPct: 45,
      humidityMaxPct: 55,
    };

    const errors = validateZoneInput(serverRoomInput);
    expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
  });

  it('validates warehouse input (1000 m², minimal loads)', () => {
    const warehouseInput = {
      areaM2: 1000,
      heightM: 5,
      orientation: 'south',
      wallUValue: 0.35,
      windowAreaM2: 50,
      windowSHGC: 0.4,
      infiltrationACH: 0.2,
      occupants: 5,
      equipmentWm2: 5,
      lightingWm2: 3,
      tempCoolingC: 24,
      humidityMinPct: 30,
      humidityMaxPct: 70,
    };

    const errors = validateZoneInput(warehouseInput);
    expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
  });
});

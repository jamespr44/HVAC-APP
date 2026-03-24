export function autoSizeEquipment(loadKw: number, areaM2: number, supplyLs: number, zoneType: string) {
  let systemType: string;
  if (areaM2 < 50 || zoneType === 'server') systemType = 'Split System';
  else if (areaM2 < 200 && zoneType !== 'lab') systemType = 'FCU';
  else systemType = 'AHU';

  const sizes = [3.5, 5, 7, 10, 12.5, 14, 18, 22, 28, 35, 45, 56, 71, 90, 112];
  const coolingCapacity = sizes.find(c => c >= loadKw * 1.1) ?? sizes[sizes.length - 1];
  const fanWPerLs = systemType === 'AHU' ? 2.5 : 1.5;

  return {
    systemType,
    coolingCapacityKw: coolingCapacity,
    heatingCapacityKw: coolingCapacity * 0.7,
    supplyAirLs: supplyLs,
    fanPowerKw: Math.round((supplyLs * fanWPerLs) / 100) / 10,
  };
}

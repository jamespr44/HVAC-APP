import { useQuery } from '@tanstack/react-query';

export interface EquipmentLoadBreakdown {
  equipmentId: string;
  name: string;
  equipmentType: string;
  sensibleW: number;
  latentW: number;
  totalW: number;
  rawSensibleW: number;
  rawLatentW: number;
  diversityFactor: number;
  partLoadPercentage: number;
  usageProfile: string;
}

export interface ZoneEquipmentLoadsResponse {
  zoneId: string;
  zoneName: string;
  totalSensibleW: number;
  totalLatentW: number;
  totalW: number;
  count: number;
  equipmentBreakdown: EquipmentLoadBreakdown[];
}

/**
 * Fetch all equipment assigned to a zone and their calculated loads with diversification
 */
export function useZoneEquipmentLoads(projectId: string, zoneId: string) {
  return useQuery<ZoneEquipmentLoadsResponse>({
    queryKey: ['zoneEquipmentLoads', projectId, zoneId],
    queryFn: async () => {
      const response = await fetch(
        `/api/projects/${projectId}/zones/${zoneId}/equipment-loads`
      );
      if (!response.ok) throw new Error('Failed to fetch equipment loads');
      return response.json();
    },
  });
}

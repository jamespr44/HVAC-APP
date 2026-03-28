import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Equipment {
  id: string;
  projectId: string;
  orgId: string;
  zoneId?: string;
  equipmentType: 'ahu' | 'fcu' | 'fan' | 'pump';
  name: string;
  model?: string;
  manufacturer?: string;
  airFlowRateM3Sec?: number;
  sensibleCapacityW?: number;
  latentCapacityW?: number;
  totalCapacityW?: number;
  powerInputW?: number;
  copOrEfficiency?: number;
  flowRateLPerMin?: number;
  headKpa?: number;
  refrigerantType?: string;
  refrigerantChargeKg?: number;
  thermalFluidType?: string;
  inOperation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentInput {
  equipmentType: string;
  name: string;
  model?: string;
  manufacturer?: string;
  airFlowRateM3Sec?: number;
  sensibleCapacityW?: number;
  latentCapacityW?: number;
  totalCapacityW?: number;
  powerInputW?: number;
  copOrEfficiency?: number;
  flowRateLPerMin?: number;
  headKpa?: number;
  refrigerantType?: string;
  refrigerantChargeKg?: number;
  thermalFluidType?: string;
  inOperation?: boolean;
  zoneId?: string;
}

const API_BASE = '/api/projects';

export function useEquipment(projectId: string) {
  return useQuery<Equipment[]>({
    queryKey: ['equipment', projectId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${projectId}/equipment`);
      if (!res.ok) throw new Error('Failed to fetch equipment');
      return res.json();
    },
  });
}

export function useEquipmentById(projectId: string, equipmentId: string) {
  return useQuery<Equipment>({
    queryKey: ['equipment', projectId, equipmentId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${projectId}/equipment/${equipmentId}`);
      if (!res.ok) throw new Error('Failed to fetch equipment');
      return res.json();
    },
    enabled: !!equipmentId,
  });
}

export function useCreateEquipment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EquipmentInput) => {
      const res = await fetch(`${API_BASE}/${projectId}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create equipment');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', projectId] });
    },
  });
}

export function useUpdateEquipment(projectId: string, equipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<EquipmentInput>) => {
      const res = await fetch(`${API_BASE}/${projectId}/equipment/${equipmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update equipment');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', projectId] });
    },
  });
}

export function useDeleteEquipment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (equipmentId: string) => {
      const res = await fetch(`${API_BASE}/${projectId}/equipment/${equipmentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete equipment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', projectId] });
    },
  });
}

export function useEquipmentMaintenance(projectId: string, equipmentId: string) {
  return useQuery({
    queryKey: ['maintenance', projectId, equipmentId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${projectId}/equipment/${equipmentId}/maintenance`);
      if (!res.ok) throw new Error('Failed to fetch maintenance records');
      return res.json();
    },
    enabled: !!equipmentId,
  });
}

export function useCreateMaintenance(projectId: string, equipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/${projectId}/equipment/${equipmentId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create maintenance record');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', projectId, equipmentId] });
    },
  });
}

export function useCompleteMaintenance(projectId: string, equipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (maintenanceId: string) => {
      const res = await fetch(
        `${API_BASE}/${projectId}/equipment/${equipmentId}/maintenance/${maintenanceId}/complete`,
        { method: 'PATCH' }
      );
      if (!res.ok) throw new Error('Failed to complete maintenance');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', projectId, equipmentId] });
    },
  });
}

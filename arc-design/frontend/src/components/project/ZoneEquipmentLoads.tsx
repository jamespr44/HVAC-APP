import { useZoneEquipmentLoads } from '@/hooks/useZoneEquipmentLoads';
import { Loader2 } from 'lucide-react';

interface ZoneEquipmentLoadsProps {
  projectId: string;
  zoneId: string;
}

export function ZoneEquipmentLoads({ projectId, zoneId }: ZoneEquipmentLoadsProps) {
  const { data, isLoading, error } = useZoneEquipmentLoads(projectId, zoneId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
        Failed to load equipment: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="px-3 py-2 bg-secondary/40 rounded text-xs text-muted-foreground">
        No equipment assigned to this zone
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 border border-[#1925AA]/20 rounded">
        <div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Sensible</div>
          <div className="font-mono font-bold text-sm">{data.totalSensibleW.toFixed(0)} W</div>
        </div>
        <div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Latent</div>
          <div className="font-mono font-bold text-sm">{data.totalLatentW.toFixed(0)} W</div>
        </div>
        <div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Total</div>
          <div className="font-mono font-bold text-sm">{data.totalW.toFixed(0)} W</div>
        </div>
      </div>

      {/* Equipment Breakdown */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Equipment Breakdown ({data.count})</div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.equipmentBreakdown.map((eq) => (
            <div key={eq.equipmentId} className="border rounded p-2 bg-secondary/20">
              <div className="flex justify-between items-start gap-2 mb-1">
                <div>
                  <div className="font-semibold text-xs">{eq.name}</div>
                  <div className="text-[9px] text-muted-foreground">{eq.equipmentType.toUpperCase()}</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="font-bold">{eq.sensibleW.toFixed(0)} W</div>
                  <div className="text-[9px] text-muted-foreground">{eq.rawSensibleW.toFixed(0)} W raw</div>
                </div>
              </div>
              <div className="text-[9px] text-muted-foreground flex gap-2">
                <span>×{eq.diversityFactor.toFixed(2)} div</span>
                <span>×{(eq.partLoadPercentage / 100).toFixed(2)} load</span>
                <span>{eq.usageProfile}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

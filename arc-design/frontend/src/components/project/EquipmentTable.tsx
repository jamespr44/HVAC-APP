import { useState } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { Equipment } from '@/hooks/useEquipment';

interface EquipmentTableProps {
  equipment: Equipment[];
  onAdd: () => void;
  onEdit: (eq: Equipment) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function EquipmentTable({ equipment, onAdd, onEdit, onDelete, isLoading }: EquipmentTableProps) {
  const [selectedType, setSelectedType] = useState<string>('');

  const filtered = selectedType ? equipment.filter(eq => eq.equipmentType === selectedType) : equipment;

  const sortedEquipment = [...filtered].sort((a, b) => {
    const aCapacity = a.totalCapacityW || 0;
    const bCapacity = b.totalCapacityW || 0;
    return bCapacity - aCapacity;
  });

  const getEquipmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ahu: 'AHU',
      fcu: 'FCU',
      fan: 'Fan',
      pump: 'Pump',
    };
    return labels[type] || type;
  };

  const getCapacityDisplay = (eq: Equipment) => {
    if (!eq.totalCapacityW) return '-';
    return `${(eq.totalCapacityW / 1000).toFixed(1)} kW`;
  };

  const getPowerDisplay = (eq: Equipment) => {
    if (!eq.powerInputW) return '-';
    return `${eq.powerInputW} W`;
  };

  const getEfficiencyDisplay = (eq: Equipment) => {
    if (eq.copOrEfficiency === undefined || eq.copOrEfficiency === null) return '-';
    return eq.equipmentType === 'pump' ? `${(eq.copOrEfficiency * 100).toFixed(0)}%` : `COP ${eq.copOrEfficiency.toFixed(1)}`;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-sm text-muted-foreground">Loading equipment...</div>;
  }

  if (equipment.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">No equipment assigned yet</p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1925AA] text-white text-sm font-medium rounded hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Equipment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 items-center">
        <label className="text-xs font-medium text-muted-foreground">Filter by type:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-2 py-1 text-xs border border-input rounded bg-white"
        >
          <option value="">All Types</option>
          <option value="ahu">AHU</option>
          <option value="fcu">FCU</option>
          <option value="fan">Fan</option>
          <option value="pump">Pump</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Name</th>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Model</th>
              <th className="px-3 py-2 text-right font-semibold">Capacity</th>
              <th className="px-3 py-2 text-right font-semibold">Power</th>
              <th className="px-3 py-2 text-right font-semibold">Efficiency</th>
              <th className="px-3 py-2 text-center font-semibold">Status</th>
              <th className="px-3 py-2 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedEquipment.map((eq) => (
              <tr key={eq.id} className="hover:bg-secondary/30">
                <td className="px-3 py-2">{eq.name}</td>
                <td className="px-3 py-2">{getEquipmentTypeLabel(eq.equipmentType)}</td>
                <td className="px-3 py-2 text-muted-foreground">{eq.model || '-'}</td>
                <td className="px-3 py-2 text-right font-mono">{getCapacityDisplay(eq)}</td>
                <td className="px-3 py-2 text-right font-mono">{getPowerDisplay(eq)}</td>
                <td className="px-3 py-2 text-right font-mono">{getEfficiencyDisplay(eq)}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${eq.inOperation ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {eq.inOperation ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2 text-center flex gap-1 justify-center">
                  <button
                    onClick={() => onEdit(eq)}
                    className="p-1 hover:bg-secondary rounded transition"
                    title="Edit equipment"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(eq.id)}
                    className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                    title="Delete equipment"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-xs text-muted-foreground">
        {sortedEquipment.length === equipment.length
          ? `${equipment.length} equipment`
          : `${sortedEquipment.length} of ${equipment.length} equipment`}
      </div>
    </div>
  );
}

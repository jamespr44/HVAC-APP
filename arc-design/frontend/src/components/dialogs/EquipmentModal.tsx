import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Equipment, EquipmentInput } from '@/hooks/useEquipment';

interface EquipmentModalProps {
  isOpen: boolean;
  equipment?: Equipment;
  onClose: () => void;
  onSubmit: (data: EquipmentInput) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string;
}

export function EquipmentModal({ isOpen, equipment, onClose, onSubmit, isLoading, errorMessage }: EquipmentModalProps) {
  const [formData, setFormData] = useState<EquipmentInput>({
    equipmentType: 'ahu',
    name: '',
    inOperation: true,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (equipment) {
      setFormData({
        equipmentType: equipment.equipmentType,
        name: equipment.name,
        model: equipment.model,
        manufacturer: equipment.manufacturer,
        airFlowRateM3Sec: equipment.airFlowRateM3Sec,
        sensibleCapacityW: equipment.sensibleCapacityW,
        latentCapacityW: equipment.latentCapacityW,
        totalCapacityW: equipment.totalCapacityW,
        powerInputW: equipment.powerInputW,
        copOrEfficiency: equipment.copOrEfficiency,
        flowRateLPerMin: equipment.flowRateLPerMin,
        headKpa: equipment.headKpa,
        refrigerantType: equipment.refrigerantType,
        refrigerantChargeKg: equipment.refrigerantChargeKg,
        thermalFluidType: equipment.thermalFluidType,
        inOperation: equipment.inOperation,
        zoneId: equipment.zoneId,
      });
    } else {
      setFormData({ equipmentType: 'ahu', name: '', inOperation: true });
    }
    setValidationErrors({});
  }, [equipment, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Equipment name is required';
    }

    if (formData.equipmentType !== 'pump' && !formData.airFlowRateM3Sec) {
      errors.airFlowRateM3Sec = 'Air flow rate is required for this equipment type';
    } else if (formData.airFlowRateM3Sec && parseFloat(String(formData.airFlowRateM3Sec)) <= 0) {
      errors.airFlowRateM3Sec = 'Air flow rate must be positive';
    }

    if (formData.copOrEfficiency && (parseFloat(String(formData.copOrEfficiency)) < 0.5 || parseFloat(String(formData.copOrEfficiency)) > 10)) {
      errors.copOrEfficiency = 'COP/Efficiency should be between 0.5 and 10';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      // Error will be displayed via errorMessage prop
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white">
          <h2 className="text-lg font-bold">{equipment ? 'Edit Equipment' : 'Add Equipment'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {errorMessage}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Equipment Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Equipment Type *</label>
                <select
                  value={formData.equipmentType}
                  onChange={(e) => handleChange('equipmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded text-sm"
                >
                  <option value="ahu">AHU (Air Handling Unit)</option>
                  <option value="fcu">FCU (Fan Coil Unit)</option>
                  <option value="fan">Fan</option>
                  <option value="pump">Pump</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Main AHU"
                  className={`w-full px-3 py-2 border rounded text-sm ${validationErrors.name ? 'border-red-500' : 'border-input'}`}
                />
                {validationErrors.name && <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Manufacturer</label>
                <input
                  type="text"
                  value={formData.manufacturer || ''}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  placeholder="e.g., HVAC Corp"
                  className="w-full px-3 py-2 border border-input rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Model</label>
                <input
                  type="text"
                  value={formData.model || ''}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="e.g., VAV-2500"
                  className="w-full px-3 py-2 border border-input rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Performance Specs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Performance Specifications</h3>

            <div className="grid grid-cols-2 gap-4">
              {formData.equipmentType !== 'pump' && (
                <div>
                  <label className="block text-xs font-medium mb-1.5">Air Flow Rate (m³/s) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.airFlowRateM3Sec || ''}
                    onChange={(e) => handleChange('airFlowRateM3Sec', parseFloat(e.target.value) || undefined)}
                    className={`w-full px-3 py-2 border rounded text-sm ${validationErrors.airFlowRateM3Sec ? 'border-red-500' : 'border-input'}`}
                  />
                  {validationErrors.airFlowRateM3Sec && <p className="text-red-600 text-xs mt-1">{validationErrors.airFlowRateM3Sec}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5">Sensible Capacity (W)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.sensibleCapacityW || ''}
                  onChange={(e) => handleChange('sensibleCapacityW', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-input rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Latent Capacity (W)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.latentCapacityW || ''}
                  onChange={(e) => handleChange('latentCapacityW', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-input rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Total Capacity (W)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.totalCapacityW || ''}
                  onChange={(e) => handleChange('totalCapacityW', parseFloat(e.target.value) || undefined)}
                  disabled
                  className="w-full px-3 py-2 border border-input rounded text-sm bg-secondary text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Auto-calculated</p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Power Input (W)</label>
                <input
                  type="number"
                  step="10"
                  value={formData.powerInputW || ''}
                  onChange={(e) => handleChange('powerInputW', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-input rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">COP / Efficiency</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.copOrEfficiency || ''}
                  onChange={(e) => handleChange('copOrEfficiency', parseFloat(e.target.value) || undefined)}
                  placeholder="e.g., 3.5"
                  className={`w-full px-3 py-2 border rounded text-sm ${validationErrors.copOrEfficiency ? 'border-red-500' : 'border-input'}`}
                />
                {validationErrors.copOrEfficiency && <p className="text-red-600 text-xs mt-1">{validationErrors.copOrEfficiency}</p>}
              </div>
            </div>
          </div>

          {/* Refrigerant/Fluid */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Refrigerant & Thermal Fluid</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Refrigerant Type</label>
                <select
                  value={formData.refrigerantType || ''}
                  onChange={(e) => handleChange('refrigerantType', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-input rounded text-sm"
                >
                  <option value="">None</option>
                  <option value="R410A">R410A</option>
                  <option value="R32">R32</option>
                  <option value="R454B">R454B</option>
                  <option value="R290">R290</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Refrigerant Charge (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.refrigerantChargeKg || ''}
                  onChange={(e) => handleChange('refrigerantChargeKg', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-input rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Thermal Fluid Type</label>
                <select
                  value={formData.thermalFluidType || ''}
                  onChange={(e) => handleChange('thermalFluidType', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-input rounded text-sm"
                >
                  <option value="">None</option>
                  <option value="water">Water</option>
                  <option value="glycol_mix">Glycol Mix</option>
                  <option value="brine">Brine</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pump-specific */}
          {formData.equipmentType === 'pump' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Pump Specifications</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">Flow Rate (L/min)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.flowRateLPerMin || ''}
                    onChange={(e) => handleChange('flowRateLPerMin', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-input rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">Head (kPa)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.headKpa || ''}
                    onChange={(e) => handleChange('headKpa', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-input rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Status</h3>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inOperation}
                onChange={(e) => handleChange('inOperation', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">In Operation</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-input rounded text-sm font-medium hover:bg-secondary transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1925AA] text-white rounded text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : equipment ? 'Update' : 'Add'} Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

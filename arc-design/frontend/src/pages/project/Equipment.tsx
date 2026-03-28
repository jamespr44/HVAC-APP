import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import { useEquipment, useCreateEquipment, useUpdateEquipment, useDeleteEquipment, Equipment, EquipmentInput } from '@/hooks/useEquipment';
import { EquipmentTable } from '@/components/project/EquipmentTable';
import { EquipmentModal } from '@/components/dialogs/EquipmentModal';

export default function EquipmentPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const equipmentQuery = useEquipment(projectId!);
  const createMutation = useCreateEquipment(projectId!);
  const updateMutation = useUpdateEquipment(projectId!, selectedEquipment?.id || '');
  const deleteMutation = useDeleteEquipment(projectId!);

  const handleAdd = useCallback(() => {
    setSelectedEquipment(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      showToast('Equipment deleted successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete equipment', 'error');
    }
  }, [deleteMutation]);

  const handleSubmit = async (data: EquipmentInput) => {
    try {
      if (selectedEquipment) {
        await updateMutation.mutateAsync(data);
        showToast('Equipment updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(data);
        showToast('Equipment added successfully', 'success');
      }
      setIsModalOpen(false);
      setSelectedEquipment(undefined);
    } catch (err: any) {
      // Error will be shown in the modal via errorMessage
      console.error(err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipment Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage AHUs, FCUs, fans, pumps, and other HVAC equipment in your project
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1925AA] text-white font-medium rounded hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Add Equipment
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-lg border flex gap-3 items-start ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{toast.message}</p>
        </div>
      )}

      {/* Equipment Table */}
      <div className="bg-white rounded-lg border border-border p-6">
        {equipmentQuery.isError ? (
          <div className="p-8 text-center text-red-600">
            <p className="text-sm">Failed to load equipment</p>
            <button
              onClick={() => equipmentQuery.refetch()}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <EquipmentTable
            equipment={equipmentQuery.data || []}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={equipmentQuery.isLoading}
          />
        )}
      </div>

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={isModalOpen}
        equipment={selectedEquipment}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEquipment(undefined);
        }}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        errorMessage={createMutation.error?.message || updateMutation.error?.message}
      />

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-blue-900 mb-2">Equipment Management Tips</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Provide accurate capacity ratings for proper system validation</li>
          <li>• Mark equipment as inactive if it has been decommissioned</li>
          <li>• Track maintenance schedules by selecting an equipment and adding maintenance records</li>
          <li>• All equipment capacities should match or exceed zone cooling loads (with 15% safety factor)</li>
        </ul>
      </div>
    </div>
  );
}

import { AlertTriangle, Plus } from 'lucide-react';

const SYSTEMS = [
  { tag: 'AHU-01', type: 'AHU', floor: 'Level 1', rooms: 5, supply: 1240, oa: 380, cooling: 38.5, heating: 22.0, stale: false },
  { tag: 'AHU-02', type: 'AHU', floor: 'Level 2', rooms: 4, supply: 980, oa: 310, cooling: 28.2, heating: 18.5, stale: true },
  { tag: 'FCU-L1-01', type: 'FCU', floor: 'Level 1', rooms: 1, supply: 280, oa: 0, cooling: 12.5, heating: 0, stale: false },
  { tag: 'EXH-01', type: 'Exhaust', floor: 'Level 1', rooms: 2, supply: 0, oa: 0, cooling: 0, heating: 0, stale: false },
];

export default function Systems() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Systems Overview</h2>
        <div className="flex gap-1.5">
          <button className="h-7 px-2.5 text-[11px] font-medium border bg-white text-foreground rounded-sm hover:bg-secondary flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-500" /> Recalculate
          </button>
          <button className="h-7 px-2.5 text-[11px] font-medium bg-primary text-primary-foreground rounded-sm hover:opacity-90 flex items-center gap-1.5">
            <Plus className="h-3 w-3" /> Add System
          </button>
        </div>
      </div>

      <div className="border rounded-sm overflow-hidden bg-white">
        <table className="w-full text-[11px]">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-2 font-semibold">Tag</th>
              <th className="text-left px-2 py-2 font-semibold">Type</th>
              <th className="text-left px-2 py-2 font-semibold">Floor</th>
              <th className="text-right px-2 py-2 font-semibold">Rooms</th>
              <th className="text-right px-2 py-2 font-semibold">Supply L/s</th>
              <th className="text-right px-2 py-2 font-semibold">OA L/s</th>
              <th className="text-right px-2 py-2 font-semibold">Cooling kW</th>
              <th className="text-right px-2 py-2 font-semibold">Heating kW</th>
              <th className="text-right px-2 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {SYSTEMS.map(sys => (
              <tr key={sys.tag} className="border-t border-border/40 hover:bg-accent/30 cursor-pointer">
                <td className="px-2 py-1.5 font-semibold text-primary">{sys.tag}</td>
                <td className="px-2 py-1.5">
                  <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${
                    sys.type === 'AHU' ? 'bg-blue-50 text-blue-700' :
                    sys.type === 'FCU' ? 'bg-green-50 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{sys.type}</span>
                </td>
                <td className="px-2 py-1.5 text-muted-foreground">{sys.floor}</td>
                <td className="px-2 py-1.5 text-right">{sys.rooms}</td>
                <td className="px-2 py-1.5 text-right font-mono">{sys.supply.toLocaleString()}</td>
                <td className="px-2 py-1.5 text-right font-mono">{sys.oa}</td>
                <td className="px-2 py-1.5 text-right font-mono font-semibold">{sys.cooling.toFixed(1)}</td>
                <td className="px-2 py-1.5 text-right font-mono">{sys.heating.toFixed(1)}</td>
                <td className="px-2 py-1.5 text-right">
                  {sys.stale ? (
                    <span className="text-[10px] font-medium text-amber-600 flex items-center justify-end gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Stale</span>
                  ) : (
                    <span className="text-[10px] font-medium text-green-600 flex items-center justify-end gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-primary/20 bg-primary/5 font-bold text-[11px]">
              <td colSpan={3} className="px-2 py-2 text-right text-[10px] uppercase tracking-widest text-primary">Totals</td>
              <td className="px-2 py-2 text-right">{SYSTEMS.reduce((s, x) => s + x.rooms, 0)}</td>
              <td className="px-2 py-2 text-right font-mono">{SYSTEMS.reduce((s, x) => s + x.supply, 0).toLocaleString()}</td>
              <td className="px-2 py-2 text-right font-mono">{SYSTEMS.reduce((s, x) => s + x.oa, 0)}</td>
              <td className="px-2 py-2 text-right font-mono">{SYSTEMS.reduce((s, x) => s + x.cooling, 0).toFixed(1)}</td>
              <td className="px-2 py-2 text-right font-mono">{SYSTEMS.reduce((s, x) => s + x.heating, 0).toFixed(1)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

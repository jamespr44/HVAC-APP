import { AlertTriangle, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

const SYSTEMS = [
  { tag: 'AHU-01', type: 'AHU', system: 'Lab', floor: 'Level 1', rooms: 3, supply: 1655, oa: 687, sensibleKw: 20.9, coolingKw: 24.1, heatingKw: 3.4, saTemp: 12, stale: false },
  { tag: 'AHU-02', type: 'AHU', system: 'Comfort', floor: 'Level 2', rooms: 1, supply: 225, oa: 68, sensibleKw: 3.0, coolingKw: 3.5, heatingKw: 0.8, saTemp: 12, stale: false },
  { tag: 'AHU-03', type: 'AHU', system: 'Critical', floor: 'Level 8', rooms: 1, supply: 200, oa: 200, sensibleKw: 8.5, coolingKw: 10.2, heatingKw: 1.5, saTemp: 12, stale: true },
];

// Mock zoning check data per sub-zone group
const ZONING_CHECKS = [
  { subZone: 'HWC-L01', ahu: 'AHU-01', rooms: 3, saTemp: 12, maxRoomT: 23.1, minRoomT: 21.2, range: 1.9, status: 'Good' as const, reheat: true },
  { subZone: 'HWC-L02', ahu: 'AHU-02', rooms: 1, saTemp: 12, maxRoomT: 22.9, minRoomT: 22.9, range: 0.0, status: 'Good' as const, reheat: true },
];

// Mock AHU psychrometric data
const AHU_PSYCHRO = [
  { tag: 'AHU-01', oaDb: 37, oaWb: 25, oaHR: 15.04, roomDb: 23, onCoilDb: 27.2, onCoilWb: 19.8, offCoilDb: 12, offCoilWb: 11.2, sensKw: 20.9, latKw: 3.2, totalKw: 24.1, chwLs: 0.72, htgKw: 3.4, hhwLs: 0.04 },
  { tag: 'AHU-02', oaDb: 37, oaWb: 25, oaHR: 15.04, roomDb: 23, onCoilDb: 27.8, onCoilWb: 20.1, offCoilDb: 12, offCoilWb: 11.3, sensKw: 3.0, latKw: 0.5, totalKw: 3.5, chwLs: 0.10, htgKw: 0.8, hhwLs: 0.01 },
];

export default function Systems() {
  return (
    <div className="p-4 space-y-6">
      {/* ─── Systems Overview ─── */}
      <div>
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
                <th className="text-left px-2 py-2 font-semibold">System</th>
                <th className="text-left px-2 py-2 font-semibold">Floor</th>
                <th className="text-right px-2 py-2 font-semibold">Rooms</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#1925AA' }}>Supply L/s</th>
                <th className="text-right px-2 py-2 font-semibold">OA L/s</th>
                <th className="text-right px-2 py-2 font-semibold">Sens kW</th>
                <th className="text-right px-2 py-2 font-semibold">Cool kW</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#c44' }}>Heat kW</th>
                <th className="text-right px-2 py-2 font-semibold">SA-T °C</th>
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
                  <td className="px-2 py-1.5 text-muted-foreground">{sys.system}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">{sys.floor}</td>
                  <td className="px-2 py-1.5 text-right">{sys.rooms}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-semibold" style={{ color: '#1925AA' }}>{sys.supply.toLocaleString()}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{sys.oa}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{sys.sensibleKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-semibold">{sys.coolingKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono" style={{ color: '#c44' }}>{sys.heatingKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">{sys.saTemp}</td>
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
                <td colSpan={4} className="px-2 py-2 text-right text-[10px] uppercase tracking-widest text-primary">Totals</td>
                <td className="px-2 py-2 text-right">{SYSTEMS.reduce((s, x) => s + x.rooms, 0)}</td>
                <td className="px-2 py-2 text-right font-mono" style={{ color: '#1925AA' }}>{SYSTEMS.reduce((s, x) => s + x.supply, 0).toLocaleString()}</td>
                <td className="px-2 py-2 text-right font-mono">{SYSTEMS.reduce((s, x) => s + x.oa, 0)}</td>
                <td className="px-2 py-2 text-right font-mono">{SYSTEMS.reduce((s, x) => s + x.sensibleKw, 0).toFixed(1)}</td>
                <td className="px-2 py-2 text-right font-mono">{SYSTEMS.reduce((s, x) => s + x.coolingKw, 0).toFixed(1)}</td>
                <td className="px-2 py-2 text-right font-mono" style={{ color: '#c44' }}>{SYSTEMS.reduce((s, x) => s + x.heatingKw, 0).toFixed(1)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ─── Zoning Check ─── */}
      <div>
        <h2 className="text-sm font-bold mb-3">Zoning Check (VAV Sub-zones)</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {ZONING_CHECKS.map(zc => (
            <div key={zc.subZone} className={`border rounded-sm p-3 bg-white ${
              zc.status === 'Good' ? 'border-green-200' : zc.status === 'Warning' ? 'border-amber-200' : 'border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs" style={{ color: '#1925AA' }}>{zc.subZone}</span>
                  <span className="text-[10px] text-muted-foreground">({zc.rooms} rooms, {zc.ahu}, SA-T = {zc.saTemp}°C)</span>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-bold ${
                  zc.status === 'Good' ? 'text-green-600' : zc.status === 'Warning' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {zc.status === 'Good' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {zc.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div>
                  <div className="text-muted-foreground">Max room T</div>
                  <div className="font-mono font-semibold">{zc.maxRoomT.toFixed(1)}°C</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Min room T</div>
                  <div className="font-mono font-semibold">{zc.minRoomT.toFixed(1)}°C</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Range</div>
                  <div className={`font-mono font-semibold ${zc.range < 2 ? 'text-green-600' : zc.range < 4 ? 'text-amber-600' : 'text-red-600'}`}>
                    {zc.range.toFixed(1)}°C
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Reheat</div>
                  <div className="font-mono font-semibold">{zc.reheat ? 'Yes (HWC)' : 'No'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── AHU Psychrometrics ─── */}
      <div>
        <h2 className="text-sm font-bold mb-3">AHU Psychrometrics</h2>
        <div className="border rounded-sm overflow-hidden bg-white">
          <table className="w-full text-[11px]">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="text-left px-2 py-2 font-semibold">AHU</th>
                <th className="text-right px-2 py-2 font-semibold">OA DB</th>
                <th className="text-right px-2 py-2 font-semibold">OA WB</th>
                <th className="text-right px-2 py-2 font-semibold">OA HR</th>
                <th className="text-right px-2 py-2 font-semibold">Room DB</th>
                <th className="text-right px-2 py-2 font-semibold">On-coil DB</th>
                <th className="text-right px-2 py-2 font-semibold">On-coil WB</th>
                <th className="text-right px-2 py-2 font-semibold">Off-coil DB</th>
                <th className="text-right px-2 py-2 font-semibold">Off-coil WB</th>
                <th className="text-right px-2 py-2 font-semibold">Sens kW</th>
                <th className="text-right px-2 py-2 font-semibold">Lat kW</th>
                <th className="text-right px-2 py-2 font-semibold font-bold">Total kW</th>
                <th className="text-right px-2 py-2 font-semibold">CHW L/s</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#c44' }}>Heat kW</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#c44' }}>HHW L/s</th>
              </tr>
            </thead>
            <tbody>
              {AHU_PSYCHRO.map(ahu => (
                <tr key={ahu.tag} className="border-t border-border/40 hover:bg-accent/30">
                  <td className="px-2 py-1.5 font-semibold text-primary">{ahu.tag}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.oaDb}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.oaWb}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.oaHR}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.roomDb}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.onCoilDb.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.onCoilWb.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-semibold">{ahu.offCoilDb}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.offCoilWb.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.sensKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.latKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-bold">{ahu.totalKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.chwLs.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right font-mono" style={{ color: '#c44' }}>{ahu.htgKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono" style={{ color: '#c44' }}>{ahu.hhwLs.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-[9px] text-muted-foreground mt-1">
          CHW flow = Q_kW / (4.19 × 8°C) at 6/14°C. HHW flow = Q_kW / (4.19 × 20°C) at 50/30°C. SHF = 1.213 W/(L/s·K).
        </div>
      </div>
    </div>
  );
}

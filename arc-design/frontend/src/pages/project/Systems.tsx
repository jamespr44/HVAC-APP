import { useZoneStore, selectVAV } from '@/store/zoneStore';
import { AlertTriangle, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

const SHF = 1.213;

export default function Systems() {
  const { zones } = useZoneStore();

  // ── Aggregate by AHU ──
  const ahuMap: Record<string, { supply: number; oa: number; sensibleW: number; heatingW: number; latentW: number; rooms: number; saTemp: number }> = {};
  for (const { inputs: z, results: r } of zones) {
    if (!ahuMap[z.ahuTag]) {
      ahuMap[z.ahuTag] = { supply: 0, oa: 0, sensibleW: 0, heatingW: 0, latentW: 0, rooms: 0, saTemp: z.saTemperatureC };
    }
    const a = ahuMap[z.ahuTag];
    a.supply += r.saFinalLs;
    a.oa += r.oaFinalLs;
    a.sensibleW += r.totalSensibleW;
    a.heatingW += r.heatingTotalW;
    a.latentW += r.peopleLatentW;
    a.rooms += 1;
  }

  // ── AHU-level psychrometrics (simplified mixing + coil calc) ──
  const OA_DB = 37, OA_WB = 25, OA_HR = 15.04;
  const RM_DB = 23, RM_HR = 9.3;
  const CHW_DT = 8; // 6/14°C
  const HHW_DT = 20; // 50/30°C

  const ahuPsychro = Object.entries(ahuMap).map(([tag, a]) => {
    const oaPct = a.supply > 0 ? a.oa / a.supply : 0;
    const onCoilDb = OA_DB * oaPct + RM_DB * (1 - oaPct);
    const onCoilHR = OA_HR * oaPct + RM_HR * (1 - oaPct);
    // Estimate WB from simplified psychrometrics (enthalpy approximation)
    const onCoilWb = onCoilDb - (onCoilDb - OA_WB) * (1 - oaPct) * 0.7;
    const offCoilDb = a.supply > 0 ? a.sensibleW / (SHF * a.supply) > 0 ? RM_DB - a.sensibleW / (SHF * a.supply) : 12 : 12;
    const sensKw = a.sensibleW / 1000;
    const latKw = a.latentW / 1000;
    const totalKw = sensKw + latKw;
    const chwLs = totalKw > 0 ? (totalKw * 1000) / (4190 * CHW_DT) : 0;
    const htgKw = a.heatingW / 1000;
    const hhwLs = htgKw > 0 ? (htgKw * 1000) / (4190 * HHW_DT) : 0;
    return { tag, oaPct, onCoilDb, onCoilWb, onCoilHR, offCoilDb, offCoilWb: offCoilDb - 0.8, sensKw, latKw, totalKw, chwLs, htgKw, hhwLs };
  });

  // ── Zoning Check per sub-zone group ──
  const subZoneGrp: Record<string, typeof zones> = {};
  for (const zr of zones) {
    if (!zr.inputs.subZoneTag) continue;
    const key = `${zr.inputs.ahuTag}::${zr.inputs.subZoneTag}`;
    if (!subZoneGrp[key]) subZoneGrp[key] = [];
    subZoneGrp[key].push(zr);
  }

  const zoningChecks = Object.entries(subZoneGrp).map(([key, zrs]) => {
    const [ahuTag, subZone] = key.split('::');
    const saTemp = zrs[0].inputs.saTemperatureC;
    const roomTemps = zrs.map(z => z.results.totalSensibleW > 0 && z.results.saFinalLs > 0
      ? z.results.totalSensibleW / (SHF * z.results.saFinalLs) + saTemp
      : z.inputs.summerRoomTempC
    );
    const maxT = Math.max(...roomTemps);
    const minT = Math.min(...roomTemps);
    const range = maxT - minT;
    const status = range < 2 ? 'Good' : range < 4 ? 'Warning' : 'Poor';
    const reheat = zrs.some(z => z.inputs.isHWCReheatZone);
    return { subZone, ahuTag, rooms: zrs.length, saTemp, maxT, minT, range, status, reheat };
  });

  const systems = Object.entries(ahuMap);
  const totSupply = systems.reduce((s, [, a]) => s + a.supply, 0);
  const totOA = systems.reduce((s, [, a]) => s + a.oa, 0);
  const totSens = systems.reduce((s, [, a]) => s + a.sensibleW / 1000, 0);
  const totCool = ahuPsychro.reduce((s, a) => s + a.totalKw, 0);
  const totHeat = systems.reduce((s, [, a]) => s + a.heatingW / 1000, 0);

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
            <button className="h-7 px-2.5 text-[11px] font-medium text-white rounded-sm hover:opacity-90 flex items-center gap-1.5" style={{ background: '#1925AA' }}>
              <Plus className="h-3 w-3" /> Add System
            </button>
          </div>
        </div>
        <div className="border rounded-sm overflow-hidden bg-white">
          <table className="w-full text-[11px]">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="text-left px-2 py-2 font-semibold">AHU Tag</th>
                <th className="text-right px-2 py-2 font-semibold">Rooms</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#1925AA' }}>Supply L/s</th>
                <th className="text-right px-2 py-2 font-semibold">OA L/s</th>
                <th className="text-right px-2 py-2 font-semibold">OA %</th>
                <th className="text-right px-2 py-2 font-semibold">Sens kW</th>
                <th className="text-right px-2 py-2 font-semibold">Cool kW</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#c44' }}>Heat kW</th>
                <th className="text-right px-2 py-2 font-semibold">SA-T °C</th>
                <th className="text-right px-2 py-2 font-semibold">CHW L/s</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#c44' }}>HHW L/s</th>
              </tr>
            </thead>
            <tbody>
              {systems.map(([tag, a]) => {
                const psych = ahuPsychro.find(p => p.tag === tag);
                return (
                  <tr key={tag} className="border-t border-border/40 hover:bg-accent/30 cursor-pointer">
                    <td className="px-2 py-1.5 font-bold" style={{ color: '#1925AA' }}>{tag}</td>
                    <td className="px-2 py-1.5 text-right">{a.rooms}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-semibold" style={{ color: '#1925AA' }}>{a.supply.toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{a.oa.toFixed(0)}</td>
                    <td className="px-2 py-1.5 text-right text-muted-foreground">{a.supply > 0 ? ((a.oa / a.supply) * 100).toFixed(0) : 0}%</td>
                    <td className="px-2 py-1.5 text-right font-mono">{(a.sensibleW / 1000).toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-semibold">{psych?.totalKw.toFixed(1) ?? '—'}</td>
                    <td className="px-2 py-1.5 text-right font-mono" style={{ color: '#c44' }}>{(a.heatingW / 1000).toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right text-muted-foreground">{a.saTemp}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{psych?.chwLs.toFixed(3) ?? '—'}</td>
                    <td className="px-2 py-1.5 text-right font-mono" style={{ color: '#c44' }}>{psych?.hhwLs.toFixed(3) ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#1925AA]/20 bg-primary/5 font-bold text-[11px]">
                <td className="px-2 py-2 text-right text-[9px] uppercase tracking-widest text-primary">Totals</td>
                <td className="px-2 py-2 text-right">{systems.reduce((s, [, a]) => s + a.rooms, 0)}</td>
                <td className="px-2 py-2 text-right font-mono" style={{ color: '#1925AA' }}>{totSupply.toLocaleString()}</td>
                <td className="px-2 py-2 text-right font-mono">{totOA.toFixed(0)}</td>
                <td className="px-2 py-2 text-right text-muted-foreground">{totSupply > 0 ? ((totOA / totSupply) * 100).toFixed(0) : 0}%</td>
                <td className="px-2 py-2 text-right font-mono">{totSens.toFixed(1)}</td>
                <td className="px-2 py-2 text-right font-mono">{totCool.toFixed(1)}</td>
                <td className="px-2 py-2 text-right font-mono" style={{ color: '#c44' }}>{totHeat.toFixed(1)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ─── Zoning Check ─── */}
      <div>
        <h2 className="text-sm font-bold mb-3">VAV Zoning Check (Sub-zones)</h2>
        {zoningChecks.length === 0 ? (
          <div className="border rounded-sm p-4 text-xs text-muted-foreground bg-white">
            No sub-zone tags assigned yet. Set Sub-zone Tag in the Zones form (e.g. HWC-L01-01).
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {zoningChecks.map(zc => (
              <div key={`${zc.ahuTag}::${zc.subZone}`} className={`border rounded-sm p-3 bg-white ${
                zc.status === 'Good' ? 'border-green-200' : zc.status === 'Warning' ? 'border-amber-200' : 'border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs" style={{ color: '#1925AA' }}>{zc.subZone}</span>
                    <span className="text-[9px] text-muted-foreground">({zc.rooms} rooms, {zc.ahuTag}, SA-T={zc.saTemp}°C)</span>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-bold ${
                    zc.status === 'Good' ? 'text-green-600' : zc.status === 'Warning' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {zc.status === 'Good' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {zc.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div><div className="text-muted-foreground">Max T</div><div className="font-mono font-semibold">{zc.maxT.toFixed(1)}°C</div></div>
                  <div><div className="text-muted-foreground">Min T</div><div className="font-mono font-semibold">{zc.minT.toFixed(1)}°C</div></div>
                  <div><div className="text-muted-foreground">Range</div>
                    <div className={`font-mono font-semibold ${zc.range < 2 ? 'text-green-600' : zc.range < 4 ? 'text-amber-600' : 'text-red-600'}`}>
                      {zc.range.toFixed(1)}°C
                    </div>
                  </div>
                  <div><div className="text-muted-foreground">Reheat</div><div className="font-mono font-semibold">{zc.reheat ? 'Yes (HWC)' : 'No'}</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                <th className="text-right px-2 py-2 font-semibold">OA HR g/kg</th>
                <th className="text-right px-2 py-2 font-semibold">Room DB</th>
                <th className="text-right px-2 py-2 font-semibold">OA%</th>
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
              {ahuPsychro.map(ahu => (
                <tr key={ahu.tag} className="border-t border-border/40 hover:bg-accent/30">
                  <td className="px-2 py-1.5 font-bold" style={{ color: '#1925AA' }}>{ahu.tag}</td>
                  <td className="px-2 py-1.5 text-right font-mono">37</td>
                  <td className="px-2 py-1.5 text-right font-mono">25</td>
                  <td className="px-2 py-1.5 text-right font-mono">15.04</td>
                  <td className="px-2 py-1.5 text-right font-mono">23</td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">{(ahu.oaPct * 100).toFixed(0)}%</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.onCoilDb.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.onCoilWb.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-semibold">{ahu.offCoilDb.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.offCoilWb.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.sensKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.latKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono font-bold">{ahu.totalKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{ahu.chwLs.toFixed(3)}</td>
                  <td className="px-2 py-1.5 text-right font-mono" style={{ color: '#c44' }}>{ahu.htgKw.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right font-mono" style={{ color: '#c44' }}>{ahu.hhwLs.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VAV Box Schedule */}
        <h2 className="text-sm font-bold mt-6 mb-3">VAV Box Schedule</h2>
        <div className="border rounded-sm overflow-hidden bg-white">
          <table className="w-full text-[11px]">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="text-left px-2 py-2 font-semibold">AHU</th>
                <th className="text-left px-2 py-2 font-semibold">Sub-Zone</th>
                <th className="text-left px-2 py-2 font-semibold" style={{ color: '#1925AA' }}>Tag</th>
                <th className="text-left px-2 py-2 font-semibold">Room</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#1925AA' }}>SA Final L/s</th>
                <th className="text-right px-2 py-2 font-semibold">VAV Size</th>
                <th className="text-right px-2 py-2 font-semibold">Min L/s</th>
                <th className="text-right px-2 py-2 font-semibold">Max L/s</th>
                <th className="text-right px-2 py-2 font-semibold">Reheat</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(({ inputs: z, results: r }) => {
                const vav = selectVAV(r.saFinalLs);
                return (
                  <tr key={z.id} className="border-t border-border/40 hover:bg-accent/30">
                    <td className="px-2 py-1.5 text-muted-foreground">{z.ahuTag}</td>
                    <td className="px-2 py-1.5 text-[9px] text-muted-foreground">{z.subZoneTag || '—'}</td>
                    <td className="px-2 py-1.5 font-semibold" style={{ color: '#1925AA' }}>{z.tag}</td>
                    <td className="px-2 py-1.5">{z.name}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-bold" style={{ color: '#1925AA' }}>{r.saFinalLs}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-bold">{vav ? `DN${vav.size * 100}` : '—'}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-muted-foreground">{vav?.minLs ?? '—'}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-muted-foreground">{vav?.maxLs ?? '—'}</td>
                    <td className="px-2 py-1.5 text-right">
                      {z.isHWCReheatZone
                        ? <span className="text-[9px] font-bold px-1 py-0.5 rounded-sm bg-orange-100 text-orange-700">HWC</span>
                        : <span className="text-[9px] text-muted-foreground">—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-[9px] text-muted-foreground mt-1">
          CHW flow = Q_kW / (4.19 × 8°C ΔT) at 6/14°C CHW · HHW flow = Q_kW / (4.19 × 20°C ΔT) at 50/30°C HHW · SHF = 1.213 W/(L/s·K)
        </div>
      </div>
    </div>
  );
}

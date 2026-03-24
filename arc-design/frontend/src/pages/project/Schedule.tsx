import { useZoneStore } from '@/store/zoneStore';
import { FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';

export default function Schedule() {
  const { zones, setSelectedId } = useZoneStore();

  // Group by floor, then by AHU within each floor
  const byFloor: Record<string, typeof zones> = {};
  for (const zr of zones) {
    const f = zr.inputs.floor;
    if (!byFloor[f]) byFloor[f] = [];
    byFloor[f].push(zr);
  }

  const allZones = zones;

  function sumW(field: keyof typeof allZones[0]['results']) {
    return allZones.reduce((s, z) => s + (z.results[field] as number), 0);
  }
  function sumI(field: keyof typeof allZones[0]['inputs']) {
    return allZones.reduce((s, z) => s + ((z.inputs[field] as number) || 0), 0);
  }
  function sumFW(zrs: typeof allZones, field: keyof typeof allZones[0]['results']) {
    return zrs.reduce((s, z) => s + (z.results[field] as number), 0);
  }

  const thBase = 'px-1.5 py-1.5 font-semibold text-muted-foreground whitespace-nowrap';
  const tdBase = 'px-1.5 py-1 whitespace-nowrap';

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold" style={{ color: '#1925AA' }}>Zone Schedule</h2>
          <p className="text-[9px] text-muted-foreground">
            Live from current project settings (weather + facade types) · SHF = 1.213 W/(L/s·K) · SA = CEILING.MATH(max(load, ACH), 5)
          </p>
        </div>
        <div className="flex gap-1.5">
          <button className="h-7 px-2.5 text-[11px] font-medium border bg-white text-foreground rounded-sm hover:bg-secondary flex items-center gap-1.5">
            <FileText className="h-3 w-3" /> PDF
          </button>
          <button className="h-7 px-2.5 text-[11px] font-medium border bg-white text-foreground rounded-sm hover:bg-secondary flex items-center gap-1.5">
            <FileSpreadsheet className="h-3 w-3" /> XLSX
          </button>
          <button
            title="Values are live from project settings and update automatically."
            className="h-7 px-2.5 text-[11px] font-medium text-white rounded-sm hover:opacity-90 flex items-center gap-1.5"
            style={{ background: '#1925AA' }}
          >
            <RefreshCw className="h-3 w-3" /> Live Sync On
          </button>
        </div>
      </div>

      <div className="border rounded-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] whitespace-nowrap border-collapse">
            <thead>
              {/* Group row */}
              <tr className="bg-secondary/80 text-[8px] uppercase tracking-widest text-muted-foreground">
                <th colSpan={4} className={`${thBase} text-left border-r border-border/30`}>Identity</th>
                <th colSpan={3} className={`${thBase} text-left border-r border-border/30`}>Room</th>
                <th colSpan={5} className={`${thBase} text-center border-r border-border/30`} style={{ color: '#1925AA' }}>Facade Loads (W)</th>
                <th colSpan={4} className={`${thBase} text-center border-r border-border/30`}>Internal Loads (W)</th>
                <th className={`${thBase} text-center border-r border-border/30`} style={{ color: '#1925AA' }}>Sens W</th>
                <th colSpan={7} className={`${thBase} text-center border-r border-border/30`} style={{ color: '#1925AA' }}>Supply Air</th>
                <th colSpan={2} className={`${thBase} text-center border-r border-border/30`}>SA-T Check</th>
                <th className={`${thBase} text-center border-r border-border/30`}>Lat</th>
                <th colSpan={4} className={`${thBase} text-center`} style={{ color: '#c44' }}>Heating (W)</th>
              </tr>
              {/* Column row */}
              <tr className="bg-secondary/50">
                <th className={`${thBase} text-left`}>AHU</th>
                <th className={`${thBase} text-left`}>Sub-Zone</th>
                <th className={`${thBase} text-left`} style={{ color: '#1925AA' }}>Tag</th>
                <th className={`${thBase} text-left border-r border-border/30`}>Name</th>
                <th className={`${thBase} text-right`}>m²</th>
                <th className={`${thBase} text-right`}>Ht</th>
                <th className={`${thBase} text-right border-r border-border/30`}>Sum T</th>
                <th className={`${thBase} text-right`}>Glass</th>
                <th className={`${thBase} text-right`}>Wall</th>
                <th className={`${thBase} text-right`}>Roof</th>
                <th className={`${thBase} text-right`}>Trans</th>
                <th className={`${thBase} text-right border-r border-border/30`}>Occ</th>
                <th className={`${thBase} text-right`}>Ppl W</th>
                <th className={`${thBase} text-right`}>Light</th>
                <th className={`${thBase} text-right`}>Equip</th>
                <th className={`${thBase} text-right border-r border-border/30`}>Infil</th>
                <th className={`${thBase} text-right font-bold border-r border-border/30`} style={{ color: '#1925AA' }}>Total W</th>
                <th className={`${thBase} text-right`}>SA-T</th>
                <th className={`${thBase} text-right`} style={{ color: '#1925AA' }}>SA L/s</th>
                <th className={`${thBase} text-right`}>OA L/s</th>
                <th className={`${thBase} text-right`}>SA ACH</th>
                <th className={`${thBase} text-right`}>OA ACH</th>
                <th className={`${thBase} text-right font-bold`} style={{ color: '#1925AA' }}>SA Final</th>
                <th className={`${thBase} text-right border-r border-border/30`}>OA%</th>
                <th className={`${thBase} text-right`}>SA-T req</th>
                <th className={`${thBase} text-right border-r border-border/30`}>Rm T</th>
                <th className={`${thBase} text-right border-r border-border/30`}>W/L/s</th>
                <th className={`${thBase} text-right`}>Glass</th>
                <th className={`${thBase} text-right`}>Facade</th>
                <th className={`${thBase} text-right`}>Roof</th>
                <th className={`${thBase} text-right`} style={{ color: '#c44' }}>Total</th>
              </tr>
            </thead>

            {Object.entries(byFloor).map(([floor, fZones]) => (
              <tbody key={floor}>
                {/* Floor grouping row */}
                <tr className="bg-secondary/20">
                  <td colSpan={31} className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{floor}</td>
                </tr>

                {fZones.map(({ inputs: z, results: r }) => {
                  const saTOk = r.saTempRequired >= z.saTemperatureC - 1;
                  return (
                    <tr
                      key={z.id}
                      onClick={() => setSelectedId(z.id)}
                      className="border-t border-border/20 hover:bg-accent/40 cursor-pointer transition-colors"
                    >
                      <td className={`${tdBase} text-muted-foreground`}>{z.ahuTag}</td>
                      <td className={`${tdBase} text-[8px] text-muted-foreground`}>{z.subZoneTag || '—'}</td>
                      <td className={`${tdBase} font-bold`} style={{ color: '#1925AA' }}>{z.tag}</td>
                      <td className={`${tdBase} border-r border-border/20 max-w-32 truncate`}>{z.name}</td>

                      <td className={`${tdBase} text-right text-muted-foreground`}>{z.areaM2}</td>
                      <td className={`${tdBase} text-right text-muted-foreground`}>{z.heightM}</td>
                      <td className={`${tdBase} text-right text-muted-foreground border-r border-border/20`}>{z.summerRoomTempC}</td>

                      <td className={`${tdBase} text-right font-mono`}>{r.glassSolarW > 0 ? r.glassSolarW.toLocaleString() : '—'}</td>
                      <td className={`${tdBase} text-right font-mono`}>{r.wallTransmissionW > 0 ? r.wallTransmissionW.toLocaleString() : '—'}</td>
                      <td className={`${tdBase} text-right font-mono`}>{r.roofTransmissionW > 0 ? r.roofTransmissionW.toLocaleString() : '—'}</td>
                      <td className={`${tdBase} text-right font-mono font-semibold`}>{r.totalFacadeW.toLocaleString()}</td>
                      <td className={`${tdBase} text-right border-r border-border/20`}>{z.occupants}</td>

                      <td className={`${tdBase} text-right font-mono`}>{r.peopleSensibleW.toLocaleString()}</td>
                      <td className={`${tdBase} text-right font-mono`}>{r.lightingW.toLocaleString()}</td>
                      <td className={`${tdBase} text-right font-mono`}>{r.equipmentW.toLocaleString()}</td>
                      <td className={`${tdBase} text-right font-mono border-r border-border/20`}>{r.infiltrationW > 0 ? r.infiltrationW.toFixed(0) : '—'}</td>

                      <td className={`${tdBase} text-right font-mono font-bold border-r border-border/20`} style={{ color: '#1925AA' }}>
                        {r.totalSensibleW.toLocaleString()}
                      </td>

                      <td className={`${tdBase} text-right text-muted-foreground`}>{z.saTemperatureC}</td>
                      <td className={`${tdBase} text-right font-mono`} style={{ color: '#1925AA' }}>{r.saForLoadLs.toFixed(0)}</td>
                      <td className={`${tdBase} text-right font-mono`}>{Math.ceil(r.oaForOccupancyLs)}</td>
                      <td className={`${tdBase} text-right text-muted-foreground`}>{r.saAchCalculated.toFixed(1)}</td>
                      <td className={`${tdBase} text-right text-muted-foreground`}>{r.oaAchCalculated.toFixed(1)}</td>
                      <td className={`${tdBase} text-right font-mono font-bold`} style={{ color: '#1925AA' }}>{r.saFinalLs}</td>
                      <td className={`${tdBase} text-right text-muted-foreground border-r border-border/20`}>{(r.oaPctOfSA * 100).toFixed(0)}%</td>

                      <td className={`${tdBase} text-right font-mono ${saTOk ? 'text-green-600' : 'text-red-600 font-bold'}`}>{r.saTempRequired.toFixed(1)}</td>
                      <td className={`${tdBase} text-right font-mono border-r border-border/20`}>
                        <span className={`text-[8px] font-bold px-1 py-0.5 rounded-sm ${saTOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {r.roomTempIfSaTRemains.toFixed(1)}°C
                        </span>
                      </td>

                      <td className={`${tdBase} text-right font-mono text-muted-foreground border-r border-border/20`}>{r.latentWPerLs.toFixed(1)}</td>

                      <td className={`${tdBase} text-right font-mono`}>{r.heatingGlassW > 0 ? r.heatingGlassW.toLocaleString() : '—'}</td>
                      <td className={`${tdBase} text-right font-mono`}>{r.heatingFacadeW > 0 ? r.heatingFacadeW.toLocaleString() : '—'}</td>
                      <td className={`${tdBase} text-right font-mono`}>{r.heatingRoofW > 0 ? r.heatingRoofW.toFixed(0) : '—'}</td>
                      <td className={`${tdBase} text-right font-mono font-semibold`} style={{ color: '#c44' }}>{r.heatingTotalW.toLocaleString()}</td>
                    </tr>
                  );
                })}

                {/* Floor subtotal */}
                <tr className="bg-secondary/30 font-semibold border-t text-[10px]">
                  <td colSpan={4} className="px-1.5 py-1.5 text-right text-[8px] uppercase tracking-widest text-muted-foreground border-r border-border/20">
                    Subtotal — {floor}
                  </td>
                  <td className="px-1.5 py-1.5 text-right">{sumI('areaM2')}</td>
                  <td colSpan={2} className="border-r border-border/20"></td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'glassSolarW').toLocaleString()}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'wallTransmissionW').toLocaleString()}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'roofTransmissionW').toLocaleString()}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'totalFacadeW').toLocaleString()}</td>
                  <td className="px-1.5 py-1.5 text-right border-r border-border/20">{fZones.reduce((s, z) => s + z.inputs.occupants, 0)}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'peopleSensibleW').toLocaleString()}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'lightingW').toLocaleString()}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'equipmentW').toLocaleString()}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono border-r border-border/20">{sumFW(fZones, 'infiltrationW').toFixed(0)}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono font-bold border-r border-border/20" style={{ color: '#1925AA' }}>
                    {sumFW(fZones, 'totalSensibleW').toLocaleString()}
                  </td>
                  <td></td>
                  <td className="px-1.5 py-1.5 text-right font-mono" style={{ color: '#1925AA' }}>{sumFW(fZones, 'saForLoadLs').toFixed(0)}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'oaForOccupancyLs').toFixed(0)}</td>
                  <td colSpan={2}></td>
                  <td className="px-1.5 py-1.5 text-right font-mono font-bold" style={{ color: '#1925AA' }}>{sumFW(fZones, 'saFinalLs').toLocaleString()}</td>
                  <td colSpan={4} className="border-r border-border/20"></td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'heatingGlassW').toLocaleString()}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'heatingFacadeW').toLocaleString()}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono">{sumFW(fZones, 'heatingRoofW').toFixed(0)}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono font-semibold" style={{ color: '#c44' }}>{sumFW(fZones, 'heatingTotalW').toLocaleString()}</td>
                </tr>
              </tbody>
            ))}

            {/* Grand Total */}
            <tfoot>
              <tr className="border-t-2 border-[#1925AA]/20 bg-primary/5 font-bold text-[10px]">
                <td colSpan={4} className="px-1.5 py-2 text-right text-[8px] uppercase tracking-widest border-r border-border/20" style={{ color: '#1925AA' }}>Grand Total</td>
                <td className="px-1.5 py-2 text-right">{sumI('areaM2')}</td>
                <td colSpan={2} className="border-r border-border/20"></td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('glassSolarW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('wallTransmissionW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('roofTransmissionW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('totalFacadeW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right border-r border-border/20">{sumI('occupants')}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('peopleSensibleW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('lightingW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('equipmentW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono border-r border-border/20">{sumW('infiltrationW').toFixed(0)}</td>
                <td className="px-1.5 py-2 text-right font-mono font-bold border-r border-border/20" style={{ color: '#1925AA' }}>{sumW('totalSensibleW').toLocaleString()}</td>
                <td></td>
                <td className="px-1.5 py-2 text-right font-mono" style={{ color: '#1925AA' }}>{sumW('saForLoadLs').toFixed(0)}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('oaForOccupancyLs').toFixed(0)}</td>
                <td colSpan={2}></td>
                <td className="px-1.5 py-2 text-right font-mono font-bold" style={{ color: '#1925AA' }}>{sumW('saFinalLs').toLocaleString()}</td>
                <td colSpan={4} className="border-r border-border/20"></td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('heatingGlassW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('heatingFacadeW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumW('heatingRoofW').toFixed(0)}</td>
                <td className="px-1.5 py-2 text-right font-mono font-bold" style={{ color: '#c44' }}>{sumW('heatingTotalW').toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex gap-4 text-[9px] text-muted-foreground mt-2">
        <span className="flex items-center gap-1"><span className="bg-green-100 text-green-700 px-1 rounded-sm font-bold">23.0°C</span> SA-T achievable — room temp in range</span>
        <span className="flex items-center gap-1"><span className="bg-red-100 text-red-600 px-1 rounded-sm font-bold">24.2°C</span> SA-T too warm — needs colder off-coil or more SA</span>
        <span title="These values auto-refresh from project-level weather and facade edits.">
          Live values from current project settings · SHF = 1.213 W/(L/s·K) · SA rounded up to nearest 5 L/s
        </span>
      </div>
    </div>
  );
}

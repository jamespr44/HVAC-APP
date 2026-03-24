import { FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';

// Mock data — updated to match Excel column order with HAP-based results
const SCHEDULE = [
  { floor: 'Level 1', zones: [
    { ahu: 'AHU-01', subZone: 'HWC-L01-01', tag: 'L1-01', name: 'Open Plan Office', facade: 'N/FT01', area: 240, ceilH: 3.0, wintT: 21, summT: 23, facadeW: 20, winArea: 38.4, glassW: 3955, wallW: 418, roofW: 0, transTotal: 4373, occ: 48, peopleSW: 3552, lightW: 1440, equipW: 3600, infilW: 0, totalSensW: 12965, saTSel: 12, saLs: 975, oaLs: 360, saAch: 11.7, oaAch: 4.5, saAchReq: 0, saFinal: 975, oaPct: 37, saTReqd: 12.0, roomTResult: 23.0, latentWLs: 2.8, htgGlassW: 1843, htgFacadeW: 270, htgRoofW: 0, htgTotalW: 2113, htgSaT: 21.0, stale: false },
    { ahu: 'AHU-01', subZone: 'HWC-L01-02', tag: 'L1-02', name: 'Meeting Room A', facade: 'E/FT02', area: 25, ceilH: 3.0, wintT: 21, summT: 23, facadeW: 5, winArea: 7.2, glassW: 662, wallW: 136, roofW: 0, transTotal: 798, occ: 8, peopleSW: 592, lightW: 150, equipW: 350, infilW: 0, totalSensW: 1890, saTSel: 12, saLs: 145, oaLs: 60, saAch: 5.8, oaAch: 2.4, saAchReq: 0, saFinal: 145, oaPct: 41, saTReqd: 11.8, roomTResult: 23.1, latentWLs: 3.1, htgGlassW: 346, htgFacadeW: 120, htgRoofW: 0, htgTotalW: 466, htgSaT: 21.0, stale: false },
    { ahu: 'AHU-01', subZone: 'HWC-L01-03', tag: 'L1-03', name: 'General Lab', facade: 'W/FT01', area: 80, ceilH: 3.0, wintT: 21, summT: 23, facadeW: 8, winArea: 14.4, glassW: 1526, wallW: 198, roofW: 0, transTotal: 1724, occ: 8, peopleSW: 592, lightW: 480, equipW: 3200, infilW: 0, totalSensW: 5996, saTSel: 12, saLs: 450, oaLs: 267, saAch: 6.8, oaAch: 0.9, saAchReq: 8, saFinal: 535, oaPct: 50, saTReqd: 13.8, roomTResult: 21.2, latentWLs: 0.8, htgGlassW: 691, htgFacadeW: 148, htgRoofW: 0, htgTotalW: 839, htgSaT: 21.0, stale: false },
  ]},
  { floor: 'Level 2', zones: [
    { ahu: 'AHU-02', subZone: 'HWC-L02-01', tag: 'L2-01', name: 'Write-up Office', facade: 'S/FT02', area: 60, ceilH: 3.0, wintT: 21, summT: 23, facadeW: 10, winArea: 19.2, glassW: 1133, wallW: 140, roofW: 0, transTotal: 1273, occ: 6, peopleSW: 444, lightW: 360, equipW: 900, infilW: 0, totalSensW: 2977, saTSel: 12, saLs: 225, oaLs: 68, saAch: 4.5, oaAch: 1.3, saAchReq: 0, saFinal: 225, oaPct: 30, saTReqd: 10.9, roomTResult: 22.9, latentWLs: 1.5, htgGlassW: 634, htgFacadeW: 162, htgRoofW: 0, htgTotalW: 796, htgSaT: 21.0, stale: false },
  ]},
];

type Zone = typeof SCHEDULE[0]['zones'][0];

function sumField(zones: Zone[], field: keyof Zone) {
  return zones.reduce((s, z) => s + (z[field] as number), 0);
}

export default function Schedule() {
  const allZones = SCHEDULE.flatMap(f => f.zones);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold" style={{ color: '#1925AA' }}>Zone Schedule</h2>
        <div className="flex gap-1.5">
          <button className="h-7 px-2.5 text-[11px] font-medium border bg-white text-foreground rounded-sm hover:bg-secondary flex items-center gap-1.5"><FileText className="h-3 w-3" /> PDF</button>
          <button className="h-7 px-2.5 text-[11px] font-medium border bg-white text-foreground rounded-sm hover:bg-secondary flex items-center gap-1.5"><FileSpreadsheet className="h-3 w-3" /> XLSX</button>
          <button className="h-7 px-2.5 text-[11px] font-medium bg-primary text-primary-foreground rounded-sm hover:opacity-90 flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> Calculate All</button>
        </div>
      </div>

      <div className="border rounded-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] whitespace-nowrap">
            <thead>
              {/* Group headers */}
              <tr className="bg-secondary/80 text-[9px] uppercase tracking-widest text-muted-foreground">
                <th colSpan={4} className="text-left px-1.5 py-1 font-bold border-r border-border/30">Identity</th>
                <th colSpan={3} className="text-left px-1.5 py-1 font-bold border-r border-border/30">Room</th>
                <th colSpan={6} className="text-center px-1.5 py-1 font-bold border-r border-border/30" style={{ color: '#1925AA' }}>Cooling Loads (W)</th>
                <th colSpan={5} className="text-center px-1.5 py-1 font-bold border-r border-border/30">Internal Loads (W)</th>
                <th className="text-center px-1.5 py-1 font-bold border-r border-border/30">Total</th>
                <th colSpan={7} className="text-center px-1.5 py-1 font-bold border-r border-border/30" style={{ color: '#1925AA' }}>Supply Air</th>
                <th colSpan={3} className="text-center px-1.5 py-1 font-bold border-r border-border/30">SA-T Check</th>
                <th className="px-1.5 py-1 font-bold border-r border-border/30">Lat</th>
                <th colSpan={4} className="text-center px-1.5 py-1 font-bold" style={{ color: '#c44' }}>Heating</th>
              </tr>
              {/* Column headers */}
              <tr className="bg-secondary/50 text-muted-foreground">
                <th className="text-left px-1.5 py-1.5 font-semibold">AHU</th>
                <th className="text-left px-1.5 py-1.5 font-semibold">Sub-Zone</th>
                <th className="text-left px-1.5 py-1.5 font-semibold">Tag</th>
                <th className="text-left px-1.5 py-1.5 font-semibold border-r border-border/30">Name</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">m²</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Ht</th>
                <th className="text-right px-1.5 py-1.5 font-semibold border-r border-border/30">T°C</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Glass</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Wall</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Roof</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Trans</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Occ</th>
                <th className="text-right px-1.5 py-1.5 font-semibold border-r border-border/30">Ppl W</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Light</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Equip</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Infil</th>
                <th className="text-right px-1.5 py-1.5 font-semibold border-r border-border/30">Total</th>
                <th className="text-right px-1.5 py-1.5 font-semibold border-r border-border/30 font-bold" style={{ color: '#1925AA' }}>Sens W</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">SA-T</th>
                <th className="text-right px-1.5 py-1.5 font-semibold" style={{ color: '#1925AA' }}>SA L/s</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">OA L/s</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">SA ACH</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">OA ACH</th>
                <th className="text-right px-1.5 py-1.5 font-semibold" style={{ color: '#1925AA' }}>SA Final</th>
                <th className="text-right px-1.5 py-1.5 font-semibold border-r border-border/30">OA%</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">SA-T req</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Room T</th>
                <th className="text-center px-1.5 py-1.5 font-semibold border-r border-border/30">OK</th>
                <th className="text-right px-1.5 py-1.5 font-semibold border-r border-border/30">W/L/s</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Glass</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Facade</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Roof</th>
                <th className="text-right px-1.5 py-1.5 font-semibold">Total</th>
              </tr>
            </thead>
            {SCHEDULE.map(floor => {
              const fZones = floor.zones;
              return (
                <tbody key={floor.floor}>
                  <tr className="bg-secondary/20">
                    <td colSpan={33} className="px-1.5 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{floor.floor}</td>
                  </tr>
                  {fZones.map(z => {
                    const saTOk = z.saTReqd >= z.saTSel - 1;
                    return (
                      <tr key={z.tag} className={`border-t border-border/30 hover:bg-accent/30 cursor-pointer ${z.stale ? 'border-l-2 border-l-amber-400' : ''}`}>
                        <td className="px-1.5 py-1 text-muted-foreground">{z.ahu}</td>
                        <td className="px-1.5 py-1 text-muted-foreground text-[9px]">{z.subZone}</td>
                        <td className="px-1.5 py-1 font-semibold" style={{ color: '#1925AA' }}>{z.tag}</td>
                        <td className="px-1.5 py-1 border-r border-border/20">{z.name}</td>
                        <td className="px-1.5 py-1 text-right text-muted-foreground">{z.area}</td>
                        <td className="px-1.5 py-1 text-right text-muted-foreground">{z.ceilH}</td>
                        <td className="px-1.5 py-1 text-right text-muted-foreground border-r border-border/20">{z.summT}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.glassW.toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.wallW.toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.roofW || '—'}</td>
                        <td className="px-1.5 py-1 text-right font-mono font-semibold">{z.transTotal.toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right">{z.occ}</td>
                        <td className="px-1.5 py-1 text-right font-mono border-r border-border/20">{z.peopleSW.toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.lightW.toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.equipW.toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.infilW || '—'}</td>
                        <td className="px-1.5 py-1 text-right font-mono border-r border-border/20">{(z.peopleSW + z.lightW + z.equipW + z.infilW).toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right font-mono font-bold border-r border-border/20" style={{ color: '#1925AA' }}>{z.totalSensW.toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right text-muted-foreground">{z.saTSel}</td>
                        <td className="px-1.5 py-1 text-right font-mono" style={{ color: '#1925AA' }}>{z.saLs}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.oaLs}</td>
                        <td className="px-1.5 py-1 text-right text-muted-foreground">{z.saAch.toFixed(1)}</td>
                        <td className="px-1.5 py-1 text-right text-muted-foreground">{z.oaAch.toFixed(1)}</td>
                        <td className="px-1.5 py-1 text-right font-mono font-bold" style={{ color: '#1925AA' }}>{z.saFinal}</td>
                        <td className="px-1.5 py-1 text-right text-muted-foreground border-r border-border/20">{z.oaPct}%</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.saTReqd.toFixed(1)}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.roomTResult.toFixed(1)}</td>
                        <td className="px-1.5 py-1 text-center border-r border-border/20">
                          <span className={`text-[9px] font-bold px-1 rounded-sm ${saTOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {saTOk ? 'OK' : '!!'}
                          </span>
                        </td>
                        <td className="px-1.5 py-1 text-right font-mono text-muted-foreground border-r border-border/20">{z.latentWLs.toFixed(1)}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.htgGlassW.toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.htgFacadeW.toLocaleString()}</td>
                        <td className="px-1.5 py-1 text-right font-mono">{z.htgRoofW || '—'}</td>
                        <td className="px-1.5 py-1 text-right font-mono font-semibold" style={{ color: '#c44' }}>{z.htgTotalW.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  {/* Floor subtotal */}
                  <tr className="bg-secondary/30 font-semibold border-t text-[10px]">
                    <td colSpan={4} className="px-1.5 py-1.5 text-right text-[9px] uppercase tracking-wider text-muted-foreground">Sub-total {floor.floor}</td>
                    <td className="px-1.5 py-1.5 text-right">{sumField(fZones, 'area')}</td>
                    <td colSpan={2} className="border-r border-border/20"></td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'glassW').toLocaleString()}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'wallW').toLocaleString()}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'roofW') || '—'}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'transTotal').toLocaleString()}</td>
                    <td className="px-1.5 py-1.5 text-right">{sumField(fZones, 'occ')}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono border-r border-border/20">{sumField(fZones, 'peopleSW').toLocaleString()}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'lightW').toLocaleString()}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'equipW').toLocaleString()}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'infilW') || '—'}</td>
                    <td className="px-1.5 py-1.5 border-r border-border/20"></td>
                    <td className="px-1.5 py-1.5 text-right font-mono font-bold border-r border-border/20" style={{ color: '#1925AA' }}>{sumField(fZones, 'totalSensW').toLocaleString()}</td>
                    <td></td>
                    <td className="px-1.5 py-1.5 text-right font-mono" style={{ color: '#1925AA' }}>{sumField(fZones, 'saLs').toLocaleString()}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'oaLs')}</td>
                    <td colSpan={2}></td>
                    <td className="px-1.5 py-1.5 text-right font-mono font-bold" style={{ color: '#1925AA' }}>{sumField(fZones, 'saFinal').toLocaleString()}</td>
                    <td colSpan={4} className="border-r border-border/20"></td>
                    <td></td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'htgGlassW').toLocaleString()}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'htgFacadeW').toLocaleString()}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono">{sumField(fZones, 'htgRoofW') || '—'}</td>
                    <td className="px-1.5 py-1.5 text-right font-mono font-semibold" style={{ color: '#c44' }}>{sumField(fZones, 'htgTotalW').toLocaleString()}</td>
                  </tr>
                </tbody>
              );
            })}
            <tfoot>
              <tr className="border-t-2 border-primary/20 bg-primary/5 font-bold text-[10px]">
                <td colSpan={4} className="px-1.5 py-2 text-right text-[9px] uppercase tracking-widest" style={{ color: '#1925AA' }}>Grand Total</td>
                <td className="px-1.5 py-2 text-right">{sumField(allZones, 'area')}</td>
                <td colSpan={2} className="border-r border-border/20"></td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'glassW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'wallW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'roofW') || '—'}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'transTotal').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right">{sumField(allZones, 'occ')}</td>
                <td className="px-1.5 py-2 text-right font-mono border-r border-border/20">{sumField(allZones, 'peopleSW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'lightW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'equipW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'infilW') || '—'}</td>
                <td className="border-r border-border/20"></td>
                <td className="px-1.5 py-2 text-right font-mono font-bold border-r border-border/20" style={{ color: '#1925AA' }}>{sumField(allZones, 'totalSensW').toLocaleString()}</td>
                <td></td>
                <td className="px-1.5 py-2 text-right font-mono" style={{ color: '#1925AA' }}>{sumField(allZones, 'saLs').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'oaLs')}</td>
                <td colSpan={2}></td>
                <td className="px-1.5 py-2 text-right font-mono font-bold" style={{ color: '#1925AA' }}>{sumField(allZones, 'saFinal').toLocaleString()}</td>
                <td colSpan={4} className="border-r border-border/20"></td>
                <td></td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'htgGlassW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'htgFacadeW').toLocaleString()}</td>
                <td className="px-1.5 py-2 text-right font-mono">{sumField(allZones, 'htgRoofW') || '—'}</td>
                <td className="px-1.5 py-2 text-right font-mono font-bold" style={{ color: '#c44' }}>{sumField(allZones, 'htgTotalW').toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex gap-4 text-[10px] text-muted-foreground mt-2">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Stale</span>
        <span className="flex items-center gap-1"><span className="bg-green-100 text-green-700 px-1 rounded-sm text-[9px] font-bold">OK</span> SA-T achievable</span>
        <span className="flex items-center gap-1"><span className="bg-red-100 text-red-600 px-1 rounded-sm text-[9px] font-bold">!!</span> SA-T too warm</span>
        <span className="text-[9px]">SHF = 1.213 W/(L/s·K) · SA rounded to nearest 5 L/s</span>
      </div>
    </div>
  );
}

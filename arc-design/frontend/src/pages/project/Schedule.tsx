import { FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';

const SCHEDULE = [
  { floor: 'Level 1', zones: [
    { tag: 'L1-01', name: 'Open Plan Office', area: 240, occ: 48, cSens: 12.8, cLat: 5.6, cTot: 18.4, htg: 8.2, supply: 485, oa: 150, exh: 0, supC: 12.5, press: '0', filt: 'F7', sys: 'AHU-01', stale: false },
    { tag: 'L1-02', name: 'Meeting Room A', area: 25, occ: 8, cSens: 2.1, cLat: 1.0, cTot: 3.1, htg: 1.5, supply: 65, oa: 42, exh: 0, supC: 12.5, press: '0', filt: 'F7', sys: 'AHU-01', stale: true },
    { tag: 'L1-03', name: 'Server Room', area: 18, occ: 0, cSens: 11.2, cLat: 1.3, cTot: 12.5, htg: 0, supply: 280, oa: 0, exh: 0, supC: 12.5, press: '+', filt: 'F9', sys: 'FCU-L1-01', stale: false },
    { tag: 'L1-04', name: 'Toilet Block', area: 30, occ: 0, cSens: 0.8, cLat: 0.4, cTot: 1.2, htg: 0.5, supply: 0, oa: 0, exh: 120, supC: 0, press: '−', filt: 'G4', sys: 'EXH-01', stale: false },
    { tag: 'L1-05', name: 'Reception', area: 60, occ: 6, cSens: 4.2, cLat: 1.6, cTot: 5.8, htg: 3.1, supply: 145, oa: 45, exh: 0, supC: 12.5, press: '+', filt: 'F7', sys: 'AHU-01', stale: false },
    { tag: 'L1-06', name: 'Kitchen', area: 35, occ: 12, cSens: 3.0, cLat: 1.2, cTot: 4.2, htg: 1.8, supply: 110, oa: 50, exh: 150, supC: 12.5, press: '−', filt: 'G4', sys: 'AHU-01', stale: true },
  ]},
  { floor: 'Level 2', zones: [
    { tag: 'L2-01', name: 'Open Plan Office', area: 280, occ: 56, cSens: 14.2, cLat: 6.1, cTot: 20.3, htg: 9.5, supply: 520, oa: 170, exh: 0, supC: 12.5, press: '0', filt: 'F7', sys: 'AHU-02', stale: false },
    { tag: 'L2-02', name: 'Conference Room', area: 45, occ: 20, cSens: 4.8, cLat: 2.4, cTot: 7.2, htg: 2.8, supply: 180, oa: 80, exh: 0, supC: 12.5, press: '0', filt: 'F7', sys: 'AHU-02', stale: false },
    { tag: 'L2-03', name: 'Director Suite', area: 30, occ: 2, cSens: 2.2, cLat: 0.8, cTot: 3.0, htg: 1.2, supply: 140, oa: 30, exh: 0, supC: 12.5, press: '+', filt: 'F7', sys: 'AHU-02', stale: false },
    { tag: 'L2-04', name: 'Print Room', area: 20, occ: 0, cSens: 3.5, cLat: 0.3, cTot: 3.8, htg: 0.8, supply: 140, oa: 30, exh: 200, supC: 12.5, press: '−', filt: 'G4', sys: 'AHU-02', stale: false },
  ]},
];

function sumField(zones: typeof SCHEDULE[0]['zones'], field: keyof typeof SCHEDULE[0]['zones'][0]) {
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
          <table className="w-full text-[11px] whitespace-nowrap">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="text-left px-2 py-2 font-semibold">Tag</th>
                <th className="text-left px-2 py-2 font-semibold">Name</th>
                <th className="text-right px-2 py-2 font-semibold">m²</th>
                <th className="text-right px-2 py-2 font-semibold">Occ</th>
                <th className="text-right px-2 py-2 font-semibold">C.Sens</th>
                <th className="text-right px-2 py-2 font-semibold">C.Lat</th>
                <th className="text-right px-2 py-2 font-semibold text-foreground">C.Tot kW</th>
                <th className="text-right px-2 py-2 font-semibold">Htg kW</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#1925AA' }}>Supply L/s</th>
                <th className="text-right px-2 py-2 font-semibold" style={{ color: '#1925AA' }}>OA L/s</th>
                <th className="text-right px-2 py-2 font-semibold">Exh L/s</th>
                <th className="text-right px-2 py-2 font-semibold">Sup °C</th>
                <th className="text-center px-2 py-2 font-semibold">Pr</th>
                <th className="text-left px-2 py-2 font-semibold">Filt</th>
                <th className="text-left px-2 py-2 font-semibold">System</th>
              </tr>
            </thead>
            {SCHEDULE.map(floor => {
              const fZones = floor.zones;
              return (
                <tbody key={floor.floor}>
                  {/* Floor group header */}
                  <tr className="bg-secondary/20">
                    <td colSpan={15} className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{floor.floor}</td>
                  </tr>
                  {/* Zone rows */}
                  {fZones.map(z => (
                    <tr key={z.tag} className={`border-t border-border/40 hover:bg-accent/30 cursor-pointer ${z.stale ? 'border-l-2 border-l-amber-400' : ''}`}>
                      <td className="px-2 py-1.5 font-semibold" style={{ color: '#1925AA' }}>
                        <span className="flex items-center gap-1">
                          {z.stale && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
                          {z.tag}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">{z.name}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{z.area}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{z.occ}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{z.cSens.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{z.cLat.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-right font-bold">{(z.cSens + z.cLat).toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{z.htg.toFixed(1)}</td>
                      <td className="px-2 py-1.5 text-right font-mono font-semibold" style={{ color: '#1925AA' }}>{z.supply || '—'}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{z.oa || '—'}</td>
                      <td className="px-2 py-1.5 text-right font-mono text-muted-foreground">{z.exh || '—'}</td>
                      <td className="px-2 py-1.5 text-right text-muted-foreground">{z.supC || '—'}</td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={`inline-block w-5 text-center text-[10px] font-bold rounded-sm py-0.5 ${
                          z.press === '−' ? 'bg-red-100 text-red-600' :
                          z.press === '+' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>{z.press}</span>
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{z.filt}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">{z.sys}</td>
                    </tr>
                  ))}
                  {/* Floor subtotal — computed from raw values */}
                  <tr className="bg-secondary/30 font-semibold border-t">
                    <td colSpan={2} className="px-2 py-1.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground">∑ {floor.floor}</td>
                    <td className="px-2 py-1.5 text-right">{sumField(fZones, 'area')}</td>
                    <td className="px-2 py-1.5 text-right">{sumField(fZones, 'occ')}</td>
                    <td className="px-2 py-1.5 text-right">{sumField(fZones, 'cSens').toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right">{sumField(fZones, 'cLat').toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right">{(sumField(fZones, 'cSens') + sumField(fZones, 'cLat')).toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right">{sumField(fZones, 'htg').toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right font-mono" style={{ color: '#1925AA' }}>{sumField(fZones, 'supply').toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{sumField(fZones, 'oa')}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{sumField(fZones, 'exh')}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tbody>
              );
            })}
            <tfoot>
              <tr className="border-t-2 border-primary/20 bg-primary/5 font-bold text-xs">
                <td colSpan={2} className="px-2 py-2 text-right text-[10px] uppercase tracking-widest" style={{ color: '#1925AA' }}>Grand Total</td>
                <td className="px-2 py-2 text-right">{sumField(allZones, 'area')}</td>
                <td className="px-2 py-2 text-right">{sumField(allZones, 'occ')}</td>
                <td className="px-2 py-2 text-right">{sumField(allZones, 'cSens').toFixed(1)}</td>
                <td className="px-2 py-2 text-right">{sumField(allZones, 'cLat').toFixed(1)}</td>
                <td className="px-2 py-2 text-right">{(sumField(allZones, 'cSens') + sumField(allZones, 'cLat')).toFixed(1)}</td>
                <td className="px-2 py-2 text-right">{sumField(allZones, 'htg').toFixed(1)}</td>
                <td className="px-2 py-2 text-right font-mono" style={{ color: '#1925AA' }}>{sumField(allZones, 'supply').toLocaleString()}</td>
                <td className="px-2 py-2 text-right font-mono">{sumField(allZones, 'oa')}</td>
                <td className="px-2 py-2 text-right font-mono">{sumField(allZones, 'exh')}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex gap-4 text-[10px] text-muted-foreground mt-2">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Stale</span>
        <span className="flex items-center gap-1"><span className="bg-red-100 text-red-600 px-1 rounded-sm text-[9px] font-bold">−</span> Negative</span>
        <span className="flex items-center gap-1"><span className="bg-blue-100 text-blue-600 px-1 rounded-sm text-[9px] font-bold">+</span> Positive</span>
      </div>
    </div>
  );
}

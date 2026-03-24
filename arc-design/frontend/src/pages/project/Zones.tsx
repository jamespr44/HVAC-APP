import { useZoneStore, ZoneInputs, selectVAV } from '@/store/zoneStore';
import { useProjectStore, REFERENCE_LOADS } from '@/store/projectStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const SEL = 'bg-[#1925AA] text-white border-[#1925AA]';
const UNSEL = 'bg-transparent text-muted-foreground border-border hover:bg-muted';

function Inp({ label, unit, hint, children }: { label: string; unit?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}{unit && <span className="font-normal ml-1 normal-case">({unit})</span>}</label>
      {children}
      {hint && <div className="text-[9px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function Num({ value, highlight, warn }: { value: string | number; highlight?: boolean; warn?: boolean }) {
  return (
    <div className={`h-7 px-2 flex items-center border rounded-sm text-xs font-mono font-bold ${highlight ? 'bg-blue-50 border-[#1925AA]/30 text-[#1925AA]' : warn ? 'bg-red-50 border-red-300 text-red-600' : 'bg-secondary border-border text-foreground'}`}>
      {value}
    </div>
  );
}

const inputCls = 'w-full h-7 px-2 border border-input bg-white text-foreground text-xs rounded-sm focus:ring-2 focus:ring-[#1925AA]/20 focus:border-[#1925AA] outline-none transition';
const selectCls = 'w-full h-7 px-2 border border-input bg-white text-foreground text-xs rounded-sm focus:ring-2 focus:ring-[#1925AA]/20 focus:border-[#1925AA] outline-none';

export default function Zones() {
  const { zones, selectedId, setSelectedId, updateZone, addZone } = useZoneStore();
  const { customFacadeTypes } = useProjectStore();
  const active = zones.find(z => z.inputs.id === selectedId) ?? zones[0];
  const { inputs: z, results: r } = active;

  function set<K extends keyof ZoneInputs>(key: K, val: ZoneInputs[K]) {
    updateZone(z.id, { [key]: val });
  }
  function num(key: keyof ZoneInputs, val: string) {
    set(key, parseFloat(val) || 0 as never);
  }

  function applyPreset(presetKey: string) {
    if (!presetKey) return;
    const ref = REFERENCE_LOADS[presetKey];
    if (ref) {
      updateZone(z.id, {
        lightingWm2: ref.lightingWm2Ref,
        equipmentWm2: ref.equipmentWm2Ref,
        achRequiredSupply: ref.achSupplyRef,
        achRequiredOA: ref.achOARef,
        occupants: Math.ceil(z.areaM2 / ref.occupantDensityM2),
      });
    }
  }

  const saTOk = r.saTempRequired >= z.saTemperatureC - 1;
  const vav = selectVAV(r.saFinalLs);
  const windowArea = (z.windowWidthM * z.windowHeightM).toFixed(1);
  const facadeArea = (z.facadeWidthM * z.heightM).toFixed(1);
  const volume = (z.areaM2 * z.heightM).toFixed(0);

  // Group zones by AHU for sidebar
  const byFloor = zones.reduce((acc, zr) => {
    const f = zr.inputs.floor;
    if (!acc[f]) acc[f] = [];
    acc[f].push(zr);
    return acc;
  }, {} as Record<string, typeof zones>);

  return (
    <div className="flex h-full gap-0">
      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <div className="w-56 shrink-0 border-r bg-secondary/30 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zones</span>
          <button onClick={addZone} className="h-5 w-5 rounded bg-[#1925AA] text-white text-xs flex items-center justify-center hover:opacity-90">+</button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {Object.entries(byFloor).map(([floor, zrs]) => (
            <div key={floor}>
              <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{floor}</div>
              {zrs.map(zr => {
                const active = zr.inputs.id === selectedId;
                const ok = zr.results.saTempRequired >= zr.inputs.saTemperatureC - 1;
                return (
                  <button
                    key={zr.inputs.id}
                    onClick={() => setSelectedId(zr.inputs.id)}
                    className={`w-full text-left px-3 py-2 border-l-2 transition-all ${active ? 'bg-white border-[#1925AA] shadow-sm' : 'border-transparent hover:bg-white/60'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]" style={{ color: '#1925AA' }}>{zr.inputs.tag}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-400'}`} />
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{zr.inputs.name}</div>
                    <div className="text-[10px] font-mono font-semibold text-foreground/70 mt-0.5">
                      {(zr.results.totalSensibleW / 1000).toFixed(1)} kW · <span style={{ color: '#1925AA' }}>{zr.results.saFinalLs} L/s</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base" style={{ color: '#1925AA' }}>{z.tag}</h2>
              <span className="text-muted-foreground">—</span>
              <span className="font-semibold text-sm">{z.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${saTOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {saTOk ? '✓ SA-T OK' : '⚠ SA-T Check!'}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {z.floor} · {z.ahuTag} · {z.areaM2} m² · {z.heightM} m · {volume} m³ · {z.facadeOrientation}/{z.facadeType}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="h-7 px-3 text-xs font-semibold border rounded-sm hover:bg-secondary transition">Save</button>
            <button className="h-7 px-3 text-xs font-semibold rounded-sm text-white hover:opacity-90 transition" style={{ background: '#1925AA' }}>Save & Next</button>
          </div>
        </div>

        {/* Live Results Banner */}
        <div className="mx-5 mt-4 rounded-lg border border-[#1925AA]/20 bg-blue-50/50 px-4 py-3 grid grid-cols-6 gap-3 text-center">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Total Sensible</div>
            <div className="font-mono font-bold text-sm" style={{ color: '#1925AA' }}>{(r.totalSensibleW / 1000).toFixed(2)} kW</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">SA Final</div>
            <div className="font-mono font-bold text-sm" style={{ color: '#1925AA' }}>{r.saFinalLs} L/s</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">OA Final</div>
            <div className="font-mono font-bold text-sm text-foreground">{Math.ceil(r.oaFinalLs)} L/s ({(r.oaPctOfSA * 100).toFixed(0)}%)</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">SA-T Required</div>
            <div className={`font-mono font-bold text-sm ${saTOk ? 'text-green-600' : 'text-red-600'}`}>{r.saTempRequired.toFixed(1)}°C</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Room T Result</div>
            <div className="font-mono font-bold text-sm text-foreground">{r.roomTempIfSaTRemains.toFixed(1)}°C</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">VAV Size</div>
            <div className="font-mono font-bold text-sm text-foreground">{vav ? `DN${vav.size * 100}` : '—'}</div>
          </div>
        </div>

        {/* Load Breakdown Mini Bar */}
        <div className="mx-5 mt-2 rounded-lg border bg-white px-4 py-2.5 grid grid-cols-7 gap-2 text-center text-[10px]">
          {[
            { label: 'Glass', val: r.glassSolarW, color: '#f59e0b' },
            { label: 'Wall', val: r.wallTransmissionW, color: '#8b5cf6' },
            { label: 'Roof', val: r.roofTransmissionW, color: '#64748b' },
            { label: 'People', val: r.peopleSensibleW, color: '#10b981' },
            { label: 'Lighting', val: r.lightingW, color: '#f97316' },
            { label: 'Equipment', val: r.equipmentW, color: '#ef4444' },
            { label: 'Infiltration', val: r.infiltrationW, color: '#06b6d4' },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[8px]">{label}</div>
              <div className="font-mono font-bold" style={{ color }}>{val > 0 ? `${val.toLocaleString()} W` : '—'}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="px-5 mt-4 pb-8">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-4 mb-5">
              <TabsTrigger value="details">Details & Facade</TabsTrigger>
              <TabsTrigger value="loads">Internal Loads</TabsTrigger>
              <TabsTrigger value="supply">Supply Air</TabsTrigger>
              <TabsTrigger value="env">Environment</TabsTrigger>
            </TabsList>

            {/* ── TAB 1: Details & Facade ── */}
            <TabsContent value="details" className="space-y-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1 mb-3">Identification</div>
                <div className="grid grid-cols-4 gap-4">
                  <Inp label="Zone Tag"><input className={inputCls} value={z.tag} onChange={e => set('tag', e.target.value)} /></Inp>
                  <Inp label="Zone Name"><input className={inputCls} value={z.name} onChange={e => set('name', e.target.value)} /></Inp>
                  <Inp label="Floor"><input className={inputCls} value={z.floor} onChange={e => set('floor', e.target.value)} /></Inp>
                  <Inp label="AHU / System"><input className={inputCls} value={z.ahuTag} onChange={e => set('ahuTag', e.target.value)} /></Inp>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1 mb-3">Dimensions</div>
                <div className="grid grid-cols-5 gap-4">
                  <Inp label="Floor Area" unit="m²"><input type="number" className={inputCls} value={z.areaM2} onChange={e => num('areaM2', e.target.value)} /></Inp>
                  <Inp label="Height" unit="m"><input type="number" className={inputCls} value={z.heightM} step={0.1} onChange={e => num('heightM', e.target.value)} /></Inp>
                  <Inp label="Volume" unit="m³"><Num value={volume} /></Inp>
                  <Inp label="Summer Setpoint" unit="°C"><input type="number" className={inputCls} value={z.summerRoomTempC} onChange={e => num('summerRoomTempC', e.target.value)} /></Inp>
                  <Inp label="Winter Setpoint" unit="°C"><input type="number" className={inputCls} value={z.winterRoomTempC} onChange={e => num('winterRoomTempC', e.target.value)} /></Inp>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1 mb-3">Facade</div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <Inp label="Orientation">
                    <div className="flex flex-wrap gap-1">
                      {['N', 'E', 'S', 'W', 'WS', 'S_SHD', 'Partition', 'Internal'].map(d => (
                        <button key={d} onClick={() => set('facadeOrientation', d)}
                          className={`px-2.5 py-1 text-xs font-semibold border rounded-sm transition ${z.facadeOrientation === d ? SEL : UNSEL}`}>{d}</button>
                      ))}
                    </div>
                  </Inp>
                  <Inp label="Facade Type">
                    <select className={selectCls} value={z.facadeType} onChange={e => set('facadeType', e.target.value)}>
                      {customFacadeTypes.map(ft => (
                        <option key={ft.id} value={ft.id}>{ft.id} — {ft.name} (U={ft.uValue.toFixed(1)}, SHGC={ft.shgc.toFixed(2)})</option>
                      ))}
                      <option value="Partition">Partition (internal wall)</option>
                      <option value="none">Internal (no facade)</option>
                    </select>
                  </Inp>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <Inp label="Facade Width" unit="m"><input type="number" className={inputCls} value={z.facadeWidthM} step={0.1} onChange={e => num('facadeWidthM', e.target.value)} /></Inp>
                  <Inp label="Facade Area" unit="m²"><Num value={facadeArea} /></Inp>
                  <Inp label="Window Width" unit="m"><input type="number" className={inputCls} value={z.windowWidthM} step={0.1} onChange={e => num('windowWidthM', e.target.value)} /></Inp>
                  <Inp label="Window Height" unit="m"><input type="number" className={inputCls} value={z.windowHeightM} step={0.1} onChange={e => num('windowHeightM', e.target.value)} /></Inp>
                  <Inp label="Window Area" unit="m²"><Num value={windowArea} /></Inp>
                </div>
                <div className="grid grid-cols-5 gap-4 mt-3 items-end">
                  <div className="flex items-center gap-2 pt-5">
                    <input type="checkbox" id="hasRoof" checked={z.hasRoof} onChange={e => set('hasRoof', e.target.checked)} className="rounded-sm" />
                    <label htmlFor="hasRoof" className="text-xs">Has Roof Exposure</label>
                  </div>
                  {z.hasRoof && (
                    <>
                      <Inp label="Exposed Roof" unit="m²"><input type="number" className={inputCls} value={z.exposedRoofAreaM2} onChange={e => num('exposedRoofAreaM2', e.target.value)} /></Inp>
                      <Inp label="Roof Type">
                        <select className={selectCls} value={z.roofType} onChange={e => set('roofType', e.target.value)}>
                          <option value="roof_top">Roof L8 (U=0.238)</option>
                          <option value="roof_other">Other Levels (U=0.27)</option>
                        </select>
                      </Inp>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ── TAB 2: Internal Loads ── */}
            <TabsContent value="loads" className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-secondary/30 border rounded-lg mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1925AA]">Apply Preset</span>
                <select className="h-7 px-2 border border-[#1925AA]/30 bg-white text-xs rounded-sm w-64 outline-none" onChange={e => applyPreset(e.target.value)} defaultValue="">
                  <option value="" disabled>Select a room type preset...</option>
                  {Object.entries(REFERENCE_LOADS).map(([k, ref]) => (
                    <option key={k} value={k}>{ref.label}</option>
                  ))}
                </select>
                <span className="text-[9px] text-muted-foreground">Auto-fills lighting, equipment, occupants, and ACH below.</span>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1 mb-3">Occupancy</div>
                <div className="grid grid-cols-5 gap-4">
                  <Inp label="Area Minimum" unit="pax" hint="= area / 10">
                    <Num value={Math.floor(z.areaM2 / 10)} />
                  </Inp>
                  <Inp label="Counted" unit="pax">
                    <input type="number" className={inputCls} value={z.occupants} onChange={e => num('occupants', e.target.value)} />
                  </Inp>
                  <Inp label="Selected (used)" unit="pax" hint="Engineer's choice">
                    <input type="number" className={`${inputCls} border-[#1925AA]/40 ring-1 ring-[#1925AA]/20`} value={z.occupants} onChange={e => num('occupants', e.target.value)} />
                  </Inp>
                  <Inp label="OA Method">
                    <select className={selectCls} value={z.oaMethod} onChange={e => set('oaMethod', e.target.value as 'general' | 'green' | 'custom')}>
                      <option value="general">AS1668.2 General (7.5 L/s/p)</option>
                      <option value="green">Green Star / NABERS (11.25 L/s/p)</option>
                      <option value="custom">Custom</option>
                    </select>
                  </Inp>
                  <Inp label="Calculated OA" unit="L/s">
                    <Num value={Math.ceil(r.oaForOccupancyLs)} highlight />
                  </Inp>
                </div>
                <div className="mt-2 px-3 py-2 bg-secondary/40 rounded-sm text-[10px] text-muted-foreground font-mono">
                  People sensible: <strong>{r.peopleSensibleW.toFixed(0)} W</strong> · Latent: <strong>{r.peopleLatentW.toFixed(0)} W</strong> · Based on room T = {z.summerRoomTempC}°C (temperature-indexed table)
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1 mb-3">Lighting & Equipment</div>
                <div className="grid grid-cols-5 gap-4">
                  <Inp label="Lighting" unit="W/m²">
                    <input type="number" className={inputCls} value={z.lightingWm2} onChange={e => num('lightingWm2', e.target.value)} />
                  </Inp>
                  <Inp label="Equipment" unit="W/m²">
                    <input type="number" className={inputCls} value={z.equipmentWm2} onChange={e => num('equipmentWm2', e.target.value)} />
                  </Inp>
                  <Inp label="Point Load" unit="W" hint="Fixed plant items">
                    <input type="number" className={inputCls} value={z.equipmentPointLoadW} onChange={e => num('equipmentPointLoadW', e.target.value)} />
                  </Inp>
                  <Inp label="W/m² × area" unit="W">
                    <Num value={(z.equipmentWm2 * z.areaM2).toLocaleString()} />
                  </Inp>
                  <Inp label="Equipment Used" unit="W" hint="max(point, W/m²×area)">
                    <Num value={r.equipmentW.toLocaleString()} highlight />
                  </Inp>
                </div>
                <div className="mt-2 px-3 py-2 bg-secondary/40 rounded-sm text-[10px] text-muted-foreground font-mono">
                  Lighting: <strong>{r.lightingW.toFixed(0)} W</strong> · Equipment: <strong>{r.equipmentW.toFixed(0)} W</strong> = max({z.equipmentPointLoadW} pt load, {(z.equipmentWm2 * z.areaM2).toFixed(0)} W/m²×area)
                </div>
              </div>
            </TabsContent>

            {/* ── TAB 3: Supply Air ── */}
            <TabsContent value="supply" className="space-y-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1 mb-3">Supply Air Parameters</div>
                <div className="grid grid-cols-5 gap-4">
                  <Inp label="SA-T Selected" unit="°C" hint="Engineer-set off-coil temp">
                    <input type="number" className={`${inputCls} border-[#1925AA]/40 ring-1 ring-[#1925AA]/20`} value={z.saTemperatureC} step={0.5} onChange={e => num('saTemperatureC', e.target.value)} />
                  </Inp>
                  <Inp label="ACH Req — Supply" hint="Min from code brief">
                    <input type="number" className={inputCls} value={z.achRequiredSupply} placeholder="e.g. 8" onChange={e => num('achRequiredSupply', e.target.value)} />
                  </Inp>
                  <Inp label="ACH Req — OA" hint="Min from AS1668.2">
                    <input type="number" className={inputCls} value={z.achRequiredOA} placeholder="e.g. 4" onChange={e => num('achRequiredOA', e.target.value)} />
                  </Inp>
                  <Inp label="Infiltration" unit="L/s" hint="0 for sealed buildings">
                    <input type="number" className={inputCls} value={z.infiltrationLs} step={0.1} onChange={e => num('infiltrationLs', e.target.value)} />
                  </Inp>
                  <div>
                    <Inp label="Sub-zone Tag" hint="e.g. HWC-L01-60">
                      <input className={inputCls} value={z.subZoneTag} onChange={e => set('subZoneTag', e.target.value)} placeholder="HWC-L01-xx" />
                    </Inp>
                    <div className="mt-2 flex items-center gap-2">
                      <input type="checkbox" id="hwcReheat" checked={z.isHWCReheatZone} onChange={e => set('isHWCReheatZone', e.target.checked)} className="rounded-sm" />
                      <label htmlFor="hwcReheat" className="text-xs">HWC Reheat Zone</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SA Results Panel */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-blue-50/50 border-[#1925AA]/20 col-span-2">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#1925AA] mb-3">Calculated Supply Air Results</div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">SA (load-based)</div>
                      <div className="font-mono font-bold text-sm">{r.saForLoadLs.toFixed(0)} L/s</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">SA (ACH-based)</div>
                      <div className="font-mono font-bold text-sm">{((z.achRequiredSupply * z.areaM2 * z.heightM) / 3.6).toFixed(0)} L/s</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">SA Final ↑5 L/s</div>
                      <div className="font-mono font-bold text-base" style={{ color: '#1925AA' }}>{r.saFinalLs} L/s</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">OA Final</div>
                      <div className="font-mono font-bold text-sm">{Math.ceil(r.oaFinalLs)} L/s ({(r.oaPctOfSA * 100).toFixed(0)}%)</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">SA ACH calc</div>
                      <div className="font-mono font-bold text-sm">{r.saAchCalculated.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">OA ACH calc</div>
                      <div className="font-mono font-bold text-sm">{r.oaAchCalculated.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">SA-T Required</div>
                      <div className={`font-mono font-bold text-sm ${saTOk ? 'text-green-600' : 'text-red-600'}`}>{r.saTempRequired.toFixed(1)}°C</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Room T Result</div>
                      <div className="font-mono font-bold text-sm">{r.roomTempIfSaTRemains.toFixed(1)}°C</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[9px] text-muted-foreground font-mono">
                    SHF = 1.213 W/(L/s·K) · SA = CEILING.MATH(max(load, ACH), 5) · Infil = (37 − {z.summerRoomTempC}) × 1.213 × {z.infiltrationLs} L/s = {r.infiltrationW.toFixed(0)} W
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-red-50/30 border-red-200">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-red-700 mb-3">Heating (Winter)</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Glass</span><span className="font-mono">{r.heatingGlassW.toFixed(0)} W</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Facade</span><span className="font-mono">{r.heatingFacadeW.toFixed(0)} W</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Roof</span><span className="font-mono">{r.heatingRoofW.toFixed(0)} W</span></div>
                    <div className="flex justify-between text-xs font-bold border-t pt-1"><span>Total Heating</span><span className="font-mono text-red-600">{r.heatingTotalW.toFixed(0)} W</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">SA-T req (htg)</span><span className="font-mono font-bold">{r.heatingRequiredSATempC.toFixed(1)}°C</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Latent W/L/s</span><span className="font-mono">{r.latentWPerLs.toFixed(1)}</span></div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── TAB 4: Environment ── */}
            <TabsContent value="env" className="space-y-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1 mb-3">Design Conditions</div>
                <div className="grid grid-cols-5 gap-4">
                  <Inp label="Summer Setpoint" unit="°C">
                    <input type="number" className={inputCls} value={z.summerRoomTempC} onChange={e => num('summerRoomTempC', e.target.value)} />
                  </Inp>
                  <Inp label="Winter Setpoint" unit="°C">
                    <input type="number" className={inputCls} value={z.winterRoomTempC} onChange={e => num('winterRoomTempC', e.target.value)} />
                  </Inp>
                  <Inp label="Min Humidity" unit="%RH"><input type="number" className={inputCls} defaultValue={40} /></Inp>
                  <Inp label="Max Humidity" unit="%RH"><input type="number" className={inputCls} defaultValue={60} /></Inp>
                  <Inp label="Filtration">
                    <select className={selectCls} defaultValue="F7">
                      <option>G4</option><option>F7</option><option>F9</option><option>HEPA</option><option>ULPA</option>
                    </select>
                  </Inp>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1 mb-3">Pressure & Classification</div>
                <div className="grid grid-cols-5 gap-4">
                  <Inp label="Pressure Regime">
                    <select className={selectCls} defaultValue="Neutral">
                      <option>Positive</option><option>Neutral</option><option>Negative</option>
                    </select>
                  </Inp>
                  <Inp label="Design Pressure" unit="Pa">
                    <input type="number" className={inputCls} defaultValue={0} />
                  </Inp>
                  <div className="col-span-2 pt-4 space-y-2">
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="rounded-sm" /> 100% Outside Air (no recirculation)</label>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="rounded-sm" /> Critical / Isolation space</label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

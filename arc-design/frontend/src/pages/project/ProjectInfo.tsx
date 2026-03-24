import { useState } from 'react';
import { useProjectStore, REFERENCE_LOADS, CustomFacadeType } from '@/store/projectStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';

const inputCls = 'w-full h-7 px-2 border border-input bg-white text-foreground text-xs rounded-sm focus:ring-2 focus:ring-[#1925AA]/20 focus:border-[#1925AA] outline-none transition';
const selectCls = 'w-full h-7 px-2 border border-input bg-white text-foreground text-xs rounded-sm focus:ring-2 focus:ring-[#1925AA]/20 focus:border-[#1925AA] outline-none';

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-1">{title}</div>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function Fld({ label, unit, hint, span, children }: { label: string; unit?: string; hint?: string; span?: number; children: React.ReactNode }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {label}{unit && <span className="font-normal normal-case ml-1">({unit})</span>}
      </label>
      {children}
      {hint && <div className="text-[9px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

export default function ProjectInfo() {
  const { info, setInfo, customFacadeTypes, addFacadeType, updateFacadeType, removeFacadeType } = useProjectStore();
  const [newFacadeOpen, setNewFacadeOpen] = useState(false);
  const [newFt, setNewFt] = useState<Partial<CustomFacadeType>>({
    id: '', name: '', uValue: 2.5, shgc: 0.25,
    hapLoads: { N: { glass: 100, wall: 18 }, E: { glass: 85, wall: 17 }, S: { glass: 60, wall: 13 }, W: { glass: 105, wall: 19 } },
    winterLoads: { N: { glass: 40, wall: 14 }, E: { glass: 40, wall: 14 }, S: { glass: 40, wall: 14 }, W: { glass: 40, wall: 14 } },
  });

  const orientations = ['N', 'E', 'S', 'W', 'WS', 'S_SHD'] as const;
  const winterOrientations = ['N', 'E', 'S', 'W'] as const;

  return (
    <div className="p-5 max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold" style={{ color: '#1925AA' }}>Project Information</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Global settings for this project — affects all calculations</p>
        </div>
        <button className="h-7 px-3 text-xs font-semibold text-white rounded-sm hover:opacity-90" style={{ background: '#1925AA' }}>
          Save Project
        </button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4 mb-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="climate">Climate & Design</TabsTrigger>
          <TabsTrigger value="facades">Facade Types</TabsTrigger>
          <TabsTrigger value="roomtypes">Room Type Presets</TabsTrigger>
        </TabsList>

        {/* ── GENERAL ── */}
        <TabsContent value="general" className="space-y-6">
          <div>
            <SectionHeader title="Project Identity" />
            <div className="grid grid-cols-3 gap-4">
              <Fld label="Project Name" span={2}><input className={inputCls} value={info.name} onChange={e => setInfo({ name: e.target.value })} /></Fld>
              <Fld label="Project Number"><input className={inputCls} value={info.projectNo} onChange={e => setInfo({ projectNo: e.target.value })} /></Fld>
              <Fld label="Client"><input className={inputCls} value={info.client} onChange={e => setInfo({ client: e.target.value })} /></Fld>
              <Fld label="Address" span={2}><input className={inputCls} value={info.address} onChange={e => setInfo({ address: e.target.value })} /></Fld>
              <Fld label="Building Class">
                <select className={selectCls} value={info.buildingClass} onChange={e => setInfo({ buildingClass: e.target.value })}>
                  <option>1a — Dwelling</option>
                  <option>5 — Office / Lab</option>
                  <option>6 — Retail / Shop</option>
                  <option>7b — Storage</option>
                  <option>8 — Factory</option>
                  <option>9a — Hospital</option>
                  <option>9b — Assembly</option>
                  <option>9c — Aged Care</option>
                  <option>Mixed</option>
                </select>
              </Fld>
            </div>
          </div>

          <div>
            <SectionHeader title="Document Control" />
            <div className="grid grid-cols-4 gap-4">
              <Fld label="Engineer"><input className={inputCls} value={info.engineer} onChange={e => setInfo({ engineer: e.target.value })} /></Fld>
              <Fld label="Checker"><input className={inputCls} value={info.checker} onChange={e => setInfo({ checker: e.target.value })} /></Fld>
              <Fld label="Revision"><input className={inputCls} value={info.revision} onChange={e => setInfo({ revision: e.target.value })} /></Fld>
              <Fld label="Date"><input type="date" className={inputCls} value={info.date} onChange={e => setInfo({ date: e.target.value })} /></Fld>
            </div>
          </div>

          {/* Project Summary Card */}
          <div className="border rounded-lg p-4 bg-secondary/30">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Document Stamp Preview</div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div><span className="text-muted-foreground">Project:</span> <strong>{info.name}</strong></div>
              <div><span className="text-muted-foreground">No:</span> <strong>{info.projectNo}</strong></div>
              <div><span className="text-muted-foreground">Client:</span> <strong>{info.client}</strong></div>
              <div><span className="text-muted-foreground">Location:</span> {info.climateLocation}</div>
              <div><span className="text-muted-foreground">Engineer:</span> {info.engineer}</div>
              <div><span className="text-muted-foreground">Rev:</span> {info.revision} — {info.date}</div>
            </div>
          </div>
        </TabsContent>

        {/* ── CLIMATE ── */}
        <TabsContent value="climate" className="space-y-6">
          <div>
            <SectionHeader title="Climate Location" sub="These values feed into every zone calculation. Based on BoM design data (AS 4055 / AIRAH DA09)." />
            <div className="grid grid-cols-4 gap-4">
              <Fld label="Location" span={2}>
                <select className={selectCls} value={info.climateLocation} onChange={e => setInfo({ climateLocation: e.target.value })}>
                  <option>Sydney (BoM Station 066062)</option>
                  <option>Melbourne (BoM Station 086071)</option>
                  <option>Brisbane (BoM Station 040842)</option>
                  <option>Adelaide (BoM Station 023034)</option>
                  <option>Perth (BoM Station 009021)</option>
                  <option>Canberra (BoM Station 070351)</option>
                  <option>Darwin (BoM Station 014015)</option>
                  <option>Custom</option>
                </select>
              </Fld>
              <Fld label="Altitude" unit="m">
                <input type="number" className={inputCls} value={info.altitudeM} onChange={e => setInfo({ altitudeM: parseFloat(e.target.value) || 0 })} />
              </Fld>
            </div>
          </div>

          <div>
            <SectionHeader title="Outdoor Design Conditions" />
            <div className="grid grid-cols-4 gap-4">
              <Fld label="Summer DB" unit="°C"><input type="number" className={inputCls} value={info.summerDbC} onChange={e => setInfo({ summerDbC: parseFloat(e.target.value) })} /></Fld>
              <Fld label="Summer WB" unit="°C"><input type="number" className={inputCls} value={info.summerWbC} onChange={e => setInfo({ summerWbC: parseFloat(e.target.value) })} /></Fld>
              <Fld label="Winter DB" unit="°C"><input type="number" className={inputCls} value={info.winterDbC} onChange={e => setInfo({ winterDbC: parseFloat(e.target.value) })} /></Fld>
              <Fld label="SHF" unit="W/(L/s·K)" hint="Non-negotiable at Sydney alt.">
                <div className="h-7 px-2 flex items-center border border-[#1925AA]/20 bg-blue-50 text-xs font-mono font-bold text-[#1925AA] rounded-sm">1.213</div>
              </Fld>
            </div>
          </div>

          <div>
            <SectionHeader title="Indoor Design Conditions" />
            <div className="grid grid-cols-4 gap-4">
              <Fld label="Summer Indoor DB" unit="°C"><input type="number" className={inputCls} value={info.summerIndoorC} onChange={e => setInfo({ summerIndoorC: parseFloat(e.target.value) })} /></Fld>
              <Fld label="Winter Indoor DB" unit="°C"><input type="number" className={inputCls} value={info.winterIndoorC} onChange={e => setInfo({ winterIndoorC: parseFloat(e.target.value) })} /></Fld>
              <Fld label="OA Rate — General" unit="L/s/p" hint="AS1668.2 Table 2.1">
                <div className="h-7 px-2 flex items-center border bg-secondary text-xs font-mono rounded-sm">7.5</div>
              </Fld>
              <Fld label="OA Rate — Green Star" unit="L/s/p">
                <div className="h-7 px-2 flex items-center border bg-secondary text-xs font-mono rounded-sm">11.25</div>
              </Fld>
            </div>
          </div>

          {/* Climate comparison table */}
          <div>
            <SectionHeader title="Australian Climate Reference" />
            <table className="w-full text-[10px] border-collapse border rounded-sm overflow-hidden">
              <thead className="bg-secondary/60">
                <tr>
                  {['City', 'Summer DB', 'Summer WB', 'Winter DB', 'MC g/kg', 'Altitude m'].map(h => (
                    <th key={h} className="text-left px-2 py-1.5 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { city: 'Sydney', sdb: 37, swb: 25, wdb: 6, mc: 15.04, alt: 6 },
                  { city: 'Melbourne', sdb: 36, swb: 24, wdb: 8, mc: 13.9, alt: 35 },
                  { city: 'Brisbane', sdb: 35, swb: 26, wdb: 12, mc: 17.2, alt: 8 },
                  { city: 'Adelaide', sdb: 40, swb: 24, wdb: 8, mc: 12.1, alt: 48 },
                  { city: 'Perth', sdb: 40, swb: 24, wdb: 9, mc: 10.6, alt: 25 },
                  { city: 'Canberra', sdb: 37, swb: 21, wdb: 2, mc: 9.2, alt: 578 },
                  { city: 'Darwin', sdb: 35, swb: 29, wdb: 24, mc: 21.0, alt: 28 },
                ].map(r => (
                  <tr key={r.city} className={`border-t ${r.city === info.climateLocation.split(' ')[0] ? 'bg-blue-50' : 'hover:bg-secondary/30'}`}>
                    <td className="px-2 py-1 font-semibold">{r.city}</td>
                    <td className="px-2 py-1 font-mono">{r.sdb}°C</td>
                    <td className="px-2 py-1 font-mono">{r.swb}°C</td>
                    <td className="px-2 py-1 font-mono">{r.wdb}°C</td>
                    <td className="px-2 py-1 font-mono">{r.mc}</td>
                    <td className="px-2 py-1 font-mono">{r.alt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── FACADE TYPES ── */}
        <TabsContent value="facades" className="space-y-4">
          <SectionHeader title="Project Facade Types (HAP-Derived)" sub="These W/m² values come from HAP software runs for this building's latitude, glazing spec, and shading. Edit per project. Add custom types for project-specific assemblies." />

          {customFacadeTypes.map((ft) => (
            <div key={ft.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/40">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm" style={{ color: '#1925AA' }}>{ft.id}</span>
                  <span className="text-sm font-medium">{ft.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">U={ft.uValue} W/m²K · SHGC={ft.shgc}</span>
                </div>
                {ft.id !== 'FT01' && ft.id !== 'FT02' && ft.id !== 'FT04' && (
                  <button onClick={() => removeFacadeType(ft.id)} className="text-muted-foreground hover:text-red-500 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </div>
              <div className="p-4 grid grid-cols-2 gap-6">
                {/* U-value & SHGC */}
                <div className="grid grid-cols-2 gap-3">
                  <Fld label="U-value" unit="W/m²K">
                    <input type="number" className={inputCls} value={ft.uValue} step={0.01} onChange={e => updateFacadeType(ft.id, { uValue: parseFloat(e.target.value) })} />
                  </Fld>
                  <Fld label="SHGC">
                    <input type="number" className={inputCls} value={ft.shgc} step={0.01} onChange={e => updateFacadeType(ft.id, { shgc: parseFloat(e.target.value) })} />
                  </Fld>
                </div>

                {/* Summer loads table */}
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Summer Loads (W/m²) — Cooling</div>
                  <table className="w-full text-[10px]">
                    <thead className="bg-secondary/40">
                      <tr><th className="text-left px-1.5 py-1">Orient</th><th className="text-right px-1.5 py-1">Glass W/m²</th><th className="text-right px-1.5 py-1">Wall W/m²</th></tr>
                    </thead>
                    <tbody>
                      {orientations.map(ori => {
                        const loads = ft.hapLoads[ori];
                        return (
                          <tr key={ori} className="border-t">
                            <td className="px-1.5 py-1 font-semibold">{ori}</td>
                            <td className="px-1.5 py-1">
                              <input type="number" className="w-full h-6 px-1 border border-input bg-white text-[10px] rounded-sm text-right" value={loads?.glass ?? 0}
                                onChange={e => updateFacadeType(ft.id, { hapLoads: { ...ft.hapLoads, [ori]: { glass: parseFloat(e.target.value) || 0, wall: loads?.wall ?? 0 } } })} />
                            </td>
                            <td className="px-1.5 py-1">
                              <input type="number" className="w-full h-6 px-1 border border-input bg-white text-[10px] rounded-sm text-right" value={loads?.wall ?? 0}
                                onChange={e => updateFacadeType(ft.id, { hapLoads: { ...ft.hapLoads, [ori]: { glass: loads?.glass ?? 0, wall: parseFloat(e.target.value) || 0 } } })} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Winter loads table */}
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Winter Loads (W/m²) — Heating</div>
                  <table className="w-full text-[10px]">
                    <thead className="bg-secondary/40">
                      <tr><th className="text-left px-1.5 py-1">Orient</th><th className="text-right px-1.5 py-1">Glass W/m²</th><th className="text-right px-1.5 py-1">Wall W/m²</th></tr>
                    </thead>
                    <tbody>
                      {winterOrientations.map(ori => {
                        const loads = ft.winterLoads[ori];
                        return (
                          <tr key={ori} className="border-t">
                            <td className="px-1.5 py-1 font-semibold">{ori}</td>
                            <td className="px-1.5 py-1">
                              <input type="number" className="w-full h-6 px-1 border border-input bg-white text-[10px] rounded-sm text-right" value={loads?.glass ?? 0}
                                onChange={e => updateFacadeType(ft.id, { winterLoads: { ...ft.winterLoads, [ori]: { glass: parseFloat(e.target.value) || 0, wall: loads?.wall ?? 0 } } })} />
                            </td>
                            <td className="px-1.5 py-1">
                              <input type="number" className="w-full h-6 px-1 border border-input bg-white text-[10px] rounded-sm text-right" value={loads?.wall ?? 0}
                                onChange={e => updateFacadeType(ft.id, { winterLoads: { ...ft.winterLoads, [ori]: { glass: loads?.glass ?? 0, wall: parseFloat(e.target.value) || 0 } } })} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setNewFacadeOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1925AA] hover:opacity-80 border border-[#1925AA]/30 rounded-sm px-3 py-1.5"
          >
            <Plus className="h-3 w-3" /> Add Facade Type
          </button>

          {newFacadeOpen && (
            <div className="border rounded-lg p-4 bg-white">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">New Facade Type</div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <Fld label="ID (e.g. FT05)"><input className={inputCls} placeholder="FT05" value={newFt.id} onChange={e => setNewFt({ ...newFt, id: e.target.value })} /></Fld>
                <Fld label="Name" span={2}><input className={inputCls} placeholder="Triple Glaze Low-E" value={newFt.name} onChange={e => setNewFt({ ...newFt, name: e.target.value })} /></Fld>
                <Fld label="U-value"><input type="number" className={inputCls} value={newFt.uValue} step={0.01} onChange={e => setNewFt({ ...newFt, uValue: parseFloat(e.target.value) })} /></Fld>
                <Fld label="SHGC"><input type="number" className={inputCls} value={newFt.shgc} step={0.01} onChange={e => setNewFt({ ...newFt, shgc: parseFloat(e.target.value) })} /></Fld>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (newFt.id && newFt.name) {
                      addFacadeType(newFt as CustomFacadeType);
                      setNewFacadeOpen(false);
                      setNewFt({ id: '', name: '', uValue: 2.5, shgc: 0.25, hapLoads: {}, winterLoads: {} });
                    }
                  }}
                  className="h-7 px-3 text-xs font-semibold text-white rounded-sm" style={{ background: '#1925AA' }}
                >Add Type</button>
                <button onClick={() => setNewFacadeOpen(false)} className="h-7 px-3 text-xs font-medium border rounded-sm">Cancel</button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── ROOM TYPE PRESETS ── */}
        <TabsContent value="roomtypes">
          <SectionHeader title="Room Type Reference Loads" sub="Industry benchmark W/m² values per room type (AIRAH DA09 / ASHRAE 90.1 / NCC). Apply as a preset in the Zones form to auto-populate default loads for comparison." />
          <div className="border rounded-sm overflow-hidden bg-white">
            <table className="w-full text-[10px]">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="text-left px-2 py-2 font-semibold">Room Type</th>
                  <th className="text-right px-2 py-2 font-semibold">Light W/m²</th>
                  <th className="text-right px-2 py-2 font-semibold">Equip W/m²</th>
                  <th className="text-right px-2 py-2 font-semibold">Occ m²/p</th>
                  <th className="text-right px-2 py-2 font-semibold">OA L/s/p</th>
                  <th className="text-right px-2 py-2 font-semibold">ACH S</th>
                  <th className="text-right px-2 py-2 font-semibold">ACH OA</th>
                  <th className="text-center px-2 py-2 font-semibold">Filter</th>
                  <th className="text-center px-2 py-2 font-semibold">Pressure</th>
                  <th className="text-right px-2 py-2 font-semibold" style={{ color: '#1925AA' }}>Ref W/m² (min–max)</th>
                  <th className="text-left px-2 py-2 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(REFERENCE_LOADS).map(([key, ref]) => (
                  <tr key={key} className="border-t hover:bg-accent/30">
                    <td className="px-2 py-1.5 font-semibold">{ref.label}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{ref.lightingWm2Ref}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{ref.equipmentWm2Ref}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{ref.occupantDensityM2}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{ref.oaLsPerPerson}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{ref.achSupplyRef || '—'}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{ref.achOARef || '—'}</td>
                    <td className="px-2 py-1.5 text-center">
                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded-sm ${
                        ref.filtration === 'HEPA' ? 'bg-purple-100 text-purple-700' :
                        ref.filtration === 'F9' ? 'bg-blue-100 text-blue-700' :
                        ref.filtration === 'F7' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{ref.filtration}</span>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded-sm ${
                        ref.pressureReg === 'Positive' ? 'bg-blue-100 text-blue-700' :
                        ref.pressureReg === 'Negative' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{ref.pressureReg}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono font-semibold" style={{ color: ref.wm2Max > 0 ? '#1925AA' : undefined }}>
                      {ref.wm2Min > 0 ? `${ref.wm2Min}–${ref.wm2Max}` : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">{ref.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[9px] text-muted-foreground mt-2">
            Apply a preset in the Zones form (Internal Loads tab) to auto-fill default values. Your current design loads are compared against these benchmarks.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

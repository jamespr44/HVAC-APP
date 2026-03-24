import { useProjectStore, AHURecord, FanRecord, PumpRecord, ChillerRecord } from '@/store/projectStore';
import { useZoneStore } from '@/store/zoneStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Trash2, FileSpreadsheet } from 'lucide-react';

const inputCls = 'w-full h-6 px-1.5 border border-input bg-white text-[10px] rounded-sm focus:ring-1 focus:ring-[#1925AA]/30 outline-none';
const selectCls = 'w-full h-6 px-1.5 border border-input bg-white text-[10px] rounded-sm outline-none';

function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <th className={`px-1.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground ${right ? 'text-right' : 'text-left'} whitespace-nowrap`}>{children}</th>;
}
function Td({ children, right, mono, bold, color }: { children?: React.ReactNode; right?: boolean; mono?: boolean; bold?: boolean; color?: string }) {
  return (
    <td className={`px-1.5 py-1 text-[10px] whitespace-nowrap ${right ? 'text-right' : ''} ${mono ? 'font-mono' : ''} ${bold ? 'font-bold' : ''}`} style={color ? { color } : undefined}>
      {children}
    </td>
  );
}

function EditableCell({ value, onChange, type = 'text', options }: {
  value: string | number; onChange: (v: string) => void; type?: string; options?: string[];
}) {
  if (options) {
    return (
      <select className={selectCls} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    );
  }
  return <input type={type} className={inputCls} value={value} onChange={e => onChange(e.target.value)} />;
}

function SectionHead({ title, sub, onExport, onAdd }: { title: string; sub?: string; onExport?: () => void; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-sm font-bold">{title}</h2>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
      <div className="flex gap-1.5">
        {onExport && (
          <button onClick={onExport} className="h-7 px-2.5 text-[11px] font-medium border bg-white text-foreground rounded-sm hover:bg-secondary flex items-center gap-1.5">
            <FileSpreadsheet className="h-3 w-3" /> Export
          </button>
        )}
        {onAdd && (
          <button onClick={onAdd} className="h-7 px-2.5 text-[11px] font-semibold text-white rounded-sm hover:opacity-90 flex items-center gap-1.5" style={{ background: '#1925AA' }}>
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
      </div>
    </div>
  );
}

export default function EquipmentSchedules() {
  const { ahus, fcus, fans, pumps, chillers, coolingTowers, addAHU, updateAHU, removeAHU, addFCU, updateFCU, removeFCU, addFan, updateFan, removeFan, addPump, updatePump, removePump, addChiller, updateChiller, removeChiller } = useProjectStore();
  const { zones } = useZoneStore();

  // Auto-sync AHU data from zones
  const ahuFromZones: Record<string, { supply: number; oa: number; sensibleKw: number; heatingKw: number; latentKw: number }> = {};
  for (const { inputs: z, results: r } of zones) {
    if (!ahuFromZones[z.ahuTag]) ahuFromZones[z.ahuTag] = { supply: 0, oa: 0, sensibleKw: 0, heatingKw: 0, latentKw: 0 };
    const a = ahuFromZones[z.ahuTag];
    a.supply += r.saFinalLs;
    a.oa += r.oaFinalLs;
    a.sensibleKw += r.totalSensibleW / 1000;
    a.heatingKw += r.heatingTotalW / 1000;
    a.latentKw += r.peopleLatentW / 1000;
  }

  // Compute chiller kW totals
  const totalCoolingKw = chillers.reduce((s, c) => s + c.coolingKw, 0);
  const totalInputKw = chillers.reduce((s, c) => s + c.inputKw, 0);

  // Footer sums
  const ahuSupplyTotal = ahus.reduce((s, a) => s + a.supplyLs, 0);
  const ahuCoolTotal = ahus.reduce((s, a) => s + a.totalCoolingKw, 0);
  const ahuHeatTotal = ahus.reduce((s, a) => s + a.heatingKw, 0);
  const ahuCHWTotal = ahus.reduce((s, a) => s + a.chwLs, 0);
  const ahuHHWTotal = ahus.reduce((s, a) => s + a.hhwLs, 0);

  return (
    <div className="p-4 space-y-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-sm font-bold" style={{ color: '#1925AA' }}>Equipment Schedules</h1>
          <p className="text-[9px] text-muted-foreground">Cooling loads auto-derived from zone calculations. All values may be overridden.</p>
        </div>
      </div>

      <Tabs defaultValue="ahu">
        <TabsList className="grid w-full grid-cols-6 mb-4">
          <TabsTrigger value="ahu">AHU</TabsTrigger>
          <TabsTrigger value="fcu">FCU</TabsTrigger>
          <TabsTrigger value="fans">Fans</TabsTrigger>
          <TabsTrigger value="pumps">Pumps</TabsTrigger>
          <TabsTrigger value="chillers">Chillers</TabsTrigger>
          <TabsTrigger value="ct">Cooling Towers</TabsTrigger>
        </TabsList>

        {/* ══ AHU ══ */}
        <TabsContent value="ahu">
          <SectionHead title="Air Handling Units" sub="Supply, OA and cooling kW auto-derived from zone calculations" onAdd={addAHU} />
          <div className="border rounded-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead className="bg-secondary/60">
                  <tr>
                    <Th>Tag</Th>
                    <Th>Location</Th>
                    <Th>System</Th>
                    <Th right>Supply L/s ↗</Th>
                    <Th right>OA L/s ↗</Th>
                    <Th right>OA%</Th>
                    <Th right>Sens kW ↗</Th>
                    <Th right>Lat kW</Th>
                    <Th right>Total kW ↗</Th>
                    <Th right>CHW L/s</Th>
                    <Th right>Heat kW ↗</Th>
                    <Th right>HHW L/s</Th>
                    <Th right>SA-T °C</Th>
                    <Th>Filter</Th>
                    <Th>Economy</Th>
                    <Th>H.Reclaim</Th>
                    <Th>Duty</Th>
                    <Th right>Static Pa</Th>
                    <Th>Notes</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {ahus.map(a => {
                    const sync = ahuFromZones[a.tag];
                    const supplyLs = sync?.supply ?? a.supplyLs;
                    const oaLs = sync?.oa ?? a.oaLs;
                    const sensKw = sync?.sensibleKw ?? a.sensibleKw;
                    const latKw = sync?.latentKw ?? a.latentKw;
                    const totalKw = sensKw + latKw;
                    const chwLs = totalKw > 0 ? totalKw * 1000 / (4190 * 8) : a.chwLs;
                    const htgKw = sync?.heatingKw ?? a.heatingKw;
                    const hhwLs = htgKw > 0 ? htgKw * 1000 / (4190 * 20) : a.hhwLs;
                    const oaPct = supplyLs > 0 ? (oaLs / supplyLs * 100).toFixed(0) : '0';
                    const synced = !!sync;
                    return (
                      <tr key={a.id} className="border-t hover:bg-accent/20">
                        <Td bold><EditableCell value={a.tag} onChange={v => updateAHU(a.id, { tag: v })} /></Td>
                        <Td><EditableCell value={a.location} onChange={v => updateAHU(a.id, { location: v })} /></Td>
                        <Td>
                          <EditableCell value={a.systemType} onChange={v => updateAHU(a.id, { systemType: v as AHURecord['systemType'] })}
                            options={['Comfort', 'Lab', 'Critical', 'General']} />
                        </Td>
                        <Td right mono color={synced ? '#1925AA' : undefined}>{Math.round(supplyLs)}{synced && <span className="text-[8px] ml-0.5">↗</span>}</Td>
                        <Td right mono>{Math.round(oaLs)}</Td>
                        <Td right>{oaPct}%</Td>
                        <Td right mono color={synced ? '#1925AA' : undefined}>{sensKw.toFixed(1)}</Td>
                        <Td right mono>{latKw.toFixed(1)}</Td>
                        <Td right mono bold color="#1925AA">{totalKw.toFixed(1)}</Td>
                        <Td right mono>{chwLs.toFixed(3)}</Td>
                        <Td right mono color="#c44">{htgKw.toFixed(1)}</Td>
                        <Td right mono color="#c44">{hhwLs.toFixed(3)}</Td>
                        <Td right>
                          <EditableCell value={a.saTemperatureC} type="number" onChange={v => updateAHU(a.id, { saTemperatureC: parseFloat(v) })} />
                        </Td>
                        <Td>
                          <EditableCell value={a.filterClass} onChange={v => updateAHU(a.id, { filterClass: v })} options={['G4', 'F7', 'F9', 'HEPA', 'ULPA']} />
                        </Td>
                        <Td>
                          <input type="checkbox" checked={a.economyCycle} onChange={e => updateAHU(a.id, { economyCycle: e.target.checked })} />
                        </Td>
                        <Td>
                          <input type="checkbox" checked={a.heatReclaim} onChange={e => updateAHU(a.id, { heatReclaim: e.target.checked })} />
                        </Td>
                        <Td>
                          <EditableCell value={a.dutySandby} onChange={v => updateAHU(a.id, { dutySandby: v as AHURecord['dutySandby'] })} options={['Single', 'Duty/Standby', 'Duty/Assist']} />
                        </Td>
                        <Td right>
                          <EditableCell value={a.extStaticPa} type="number" onChange={v => updateAHU(a.id, { extStaticPa: parseFloat(v) })} />
                        </Td>
                        <Td><EditableCell value={a.notes} onChange={v => updateAHU(a.id, { notes: v })} /></Td>
                        <Td><button onClick={() => removeAHU(a.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button></Td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#1925AA]/20 bg-primary/5 font-bold text-[10px]">
                    <td colSpan={3} className="px-1.5 py-1.5 text-right text-[9px] uppercase tracking-widest text-primary">Totals</td>
                    <Td right mono bold color="#1925AA">{Math.round(ahuSupplyTotal)}</Td>
                    <td colSpan={2}></td>
                    <td></td>
                    <td></td>
                    <Td right mono bold color="#1925AA">{ahuCoolTotal.toFixed(1)}</Td>
                    <Td right mono bold>{ahuCHWTotal.toFixed(3)}</Td>
                    <Td right mono bold color="#c44">{ahuHeatTotal.toFixed(1)}</Td>
                    <Td right mono bold color="#c44">{ahuHHWTotal.toFixed(3)}</Td>
                    <td colSpan={8}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">↗ = auto-derived from zone calculations. CHW at 6/14°C (ΔT=8°C). HHW at 50/30°C (ΔT=20°C).</p>
        </TabsContent>

        {/* ══ FCU ══ */}
        <TabsContent value="fcu">
          <SectionHead title="Fan Coil Units" sub="Room-level terminal cooling with CHW/HHW coils" onAdd={addFCU} />
          <div className="border rounded-sm overflow-hidden bg-white">
            <table className="w-full text-[10px]">
              <thead className="bg-secondary/60">
                <tr>
                  <Th>Tag</Th>
                  <Th>Location</Th>
                  <Th>Room Tag</Th>
                  <Th right>Supply L/s</Th>
                  <Th right>Cool kW</Th>
                  <Th right>CHW L/s</Th>
                  <Th right>Heat kW</Th>
                  <Th right>HHW L/s</Th>
                  <Th>Filter</Th>
                  <Th>Notes</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {fcus.map(f => (
                  <tr key={f.id} className="border-t hover:bg-accent/20">
                    <Td bold><EditableCell value={f.tag} onChange={v => updateFCU(f.id, { tag: v })} /></Td>
                    <Td><EditableCell value={f.location} onChange={v => updateFCU(f.id, { location: v })} /></Td>
                    <Td><EditableCell value={f.roomTag} onChange={v => updateFCU(f.id, { roomTag: v })} /></Td>
                    <Td right mono><EditableCell value={f.supplyLs} type="number" onChange={v => updateFCU(f.id, { supplyLs: parseFloat(v) })} /></Td>
                    <Td right mono bold color="#1925AA"><EditableCell value={f.coolingKw} type="number" onChange={v => updateFCU(f.id, { coolingKw: parseFloat(v) })} /></Td>
                    <Td right mono>{f.coolingKw > 0 ? (f.coolingKw * 1000 / (4190 * 8)).toFixed(3) : '—'}</Td>
                    <Td right mono color="#c44"><EditableCell value={f.heatingKw} type="number" onChange={v => updateFCU(f.id, { heatingKw: parseFloat(v) })} /></Td>
                    <Td right mono color="#c44">{f.heatingKw > 0 ? (f.heatingKw * 1000 / (4190 * 20)).toFixed(3) : '—'}</Td>
                    <Td><EditableCell value={f.filterClass} onChange={v => updateFCU(f.id, { filterClass: v })} options={['G4', 'F7', 'F9']} /></Td>
                    <Td><EditableCell value={f.notes} onChange={v => updateFCU(f.id, { notes: v })} /></Td>
                    <Td><button onClick={() => removeFCU(f.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button></Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#1925AA]/20 bg-primary/5 font-bold">
                  <td colSpan={3} className="px-1.5 py-1.5 text-right text-[9px] uppercase tracking-widest text-primary">Totals</td>
                  <Td right mono bold>{fcus.reduce((s, f) => s + f.supplyLs, 0)}</Td>
                  <Td right mono bold color="#1925AA">{fcus.reduce((s, f) => s + f.coolingKw, 0).toFixed(1)}</Td>
                  <td></td>
                  <Td right mono bold color="#c44">{fcus.reduce((s, f) => s + f.heatingKw, 0).toFixed(1)}</Td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </TabsContent>

        {/* ══ FANS ══ */}
        <TabsContent value="fans">
          <SectionHead title="Fan Schedule" sub="Supply, return, exhaust, transfer and smoke fans" onAdd={addFan} />
          <div className="border rounded-sm overflow-hidden bg-white">
            <table className="w-full text-[10px]">
              <thead className="bg-secondary/60">
                <tr>
                  <Th>Tag</Th>
                  <Th>Type</Th>
                  <Th>Location</Th>
                  <Th>Serves Zone</Th>
                  <Th right>Flow L/s</Th>
                  <Th right>Static Pa</Th>
                  <Th right>Motor kW</Th>
                  <Th>Duty</Th>
                  <Th>Notes</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {fans.map(f => (
                  <tr key={f.id} className="border-t hover:bg-accent/20">
                    <Td bold><EditableCell value={f.tag} onChange={v => updateFan(f.id, { tag: v })} /></Td>
                    <Td>
                      <EditableCell value={f.type} onChange={v => updateFan(f.id, { type: v as FanRecord['type'] })}
                        options={['Supply', 'Return', 'Exhaust', 'Transfer', 'Smoke', 'General']} />
                    </Td>
                    <Td><EditableCell value={f.location} onChange={v => updateFan(f.id, { location: v })} /></Td>
                    <Td><EditableCell value={f.servesZone} onChange={v => updateFan(f.id, { servesZone: v })} /></Td>
                    <Td right mono bold color="#1925AA"><EditableCell value={f.flowLs} type="number" onChange={v => updateFan(f.id, { flowLs: parseFloat(v) })} /></Td>
                    <Td right mono><EditableCell value={f.staticPa} type="number" onChange={v => updateFan(f.id, { staticPa: parseFloat(v) })} /></Td>
                    <Td right mono><EditableCell value={f.motorKw} type="number" onChange={v => updateFan(f.id, { motorKw: parseFloat(v) })} /></Td>
                    <Td><EditableCell value={f.dutySandby} onChange={v => updateFan(f.id, { dutySandby: v as FanRecord['dutySandby'] })} options={['Single', 'Duty/Standby']} /></Td>
                    <Td><EditableCell value={f.notes} onChange={v => updateFan(f.id, { notes: v })} /></Td>
                    <Td><button onClick={() => removeFan(f.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button></Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#1925AA]/20 bg-primary/5 font-bold">
                  <td colSpan={4} className="px-1.5 py-1.5 text-right text-[9px] uppercase tracking-widest text-primary">Totals</td>
                  <Td right mono bold color="#1925AA">{fans.reduce((s, f) => s + f.flowLs, 0)}</Td>
                  <td></td>
                  <Td right mono bold>{fans.reduce((s, f) => s + f.motorKw, 0).toFixed(2)} kW</Td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </TabsContent>

        {/* ══ PUMPS ══ */}
        <TabsContent value="pumps">
          <SectionHead title="Pump Schedule" sub="CHW, HHW and condenser water pumps" onAdd={addPump} />
          <div className="border rounded-sm overflow-hidden bg-white">
            <table className="w-full text-[10px]">
              <thead className="bg-secondary/60">
                <tr>
                  <Th>Tag</Th>
                  <Th>Service</Th>
                  <Th right>Flow L/s</Th>
                  <Th right>Head kPa</Th>
                  <Th right>Motor kW</Th>
                  <Th>Duty</Th>
                  <Th>Notes</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {pumps.map(p => (
                  <tr key={p.id} className="border-t hover:bg-accent/20">
                    <Td bold><EditableCell value={p.tag} onChange={v => updatePump(p.id, { tag: v })} /></Td>
                    <Td>
                      <EditableCell value={p.service} onChange={v => updatePump(p.id, { service: v as PumpRecord['service'] })}
                        options={['CHW Primary', 'CHW Secondary', 'HHW', 'Condenser', 'General']} />
                    </Td>
                    <Td right mono bold color="#1925AA"><EditableCell value={p.flowLs} type="number" onChange={v => updatePump(p.id, { flowLs: parseFloat(v) })} /></Td>
                    <Td right mono><EditableCell value={p.headKpa} type="number" onChange={v => updatePump(p.id, { headKpa: parseFloat(v) })} /></Td>
                    <Td right mono><EditableCell value={p.motorKw} type="number" onChange={v => updatePump(p.id, { motorKw: parseFloat(v) })} /></Td>
                    <Td><EditableCell value={p.dutySandby} onChange={v => updatePump(p.id, { dutySandby: v as PumpRecord['dutySandby'] })} options={['Single', 'Duty/Standby']} /></Td>
                    <Td><EditableCell value={p.notes} onChange={v => updatePump(p.id, { notes: v })} /></Td>
                    <Td><button onClick={() => removePump(p.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button></Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#1925AA]/20 bg-primary/5 font-bold">
                  <td colSpan={2} className="px-1.5 py-1.5 text-right text-[9px] uppercase tracking-widest text-primary">Totals</td>
                  <Td right mono bold color="#1925AA">{pumps.reduce((s, p) => s + p.flowLs, 0).toFixed(2)}</Td>
                  <td></td>
                  <Td right mono bold>{pumps.reduce((s, p) => s + p.motorKw, 0).toFixed(2)} kW</Td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </TabsContent>

        {/* ══ CHILLERS ══ */}
        <TabsContent value="chillers">
          <SectionHead title="Chiller Schedule" sub="Total cooling kW auto-derived from AHU schedule. CHW/CW flows auto-calculated." onAdd={addChiller} />

          {/* Load summary banner */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total AHU Cooling', val: `${ahuCoolTotal.toFixed(1)} kW`, color: '#1925AA' },
              { label: 'Total FCU Cooling', val: `${fcus.reduce((s, f) => s + f.coolingKw, 0).toFixed(1)} kW`, color: '#1925AA' },
              { label: 'Chiller Plant Total', val: `${totalCoolingKw.toFixed(1)} kW`, color: '#1925AA' },
              { label: 'Total Input Power', val: `${totalInputKw.toFixed(1)} kW`, color: '#64748b' },
            ].map(item => (
              <div key={item.label} className="border rounded-lg p-3 bg-white text-center">
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</div>
                <div className="font-mono font-bold text-base mt-1" style={{ color: item.color }}>{item.val}</div>
              </div>
            ))}
          </div>

          <div className="border rounded-sm overflow-hidden bg-white">
            <table className="w-full text-[10px]">
              <thead className="bg-secondary/60">
                <tr>
                  <Th>Tag</Th>
                  <Th>Type</Th>
                  <Th right>Cool kW</Th>
                  <Th right>COP</Th>
                  <Th right>Input kW</Th>
                  <Th right>CHW in °C</Th>
                  <Th right>CHW out °C</Th>
                  <Th right>CHW L/s</Th>
                  <Th right>CW in °C</Th>
                  <Th right>CW out °C</Th>
                  <Th right>CW L/s</Th>
                  <Th>Refrig.</Th>
                  <Th>Duty</Th>
                  <Th>Notes</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {chillers.map(c => {
                  const chwLs = c.coolingKw > 0 ? c.coolingKw * 1000 / (4190 * (c.chwInC - c.chwOutC)) : c.chwFlowLs;
                  const cwLs = c.inputKw > 0 && c.coolingKw > 0 ? (c.coolingKw + c.inputKw) * 1000 / (4190 * (c.cwOutC - c.cwInC)) : c.cwFlowLs;
                  const inputKw = c.cop > 0 ? c.coolingKw / c.cop : c.inputKw;
                  return (
                    <tr key={c.id} className="border-t hover:bg-accent/20">
                      <Td bold><EditableCell value={c.tag} onChange={v => updateChiller(c.id, { tag: v })} /></Td>
                      <Td>
                        <EditableCell value={c.type} onChange={v => updateChiller(c.id, { type: v as ChillerRecord['type'] })}
                          options={['Centrifugal', 'Screw', 'Scroll', 'Absorption']} />
                      </Td>
                      <Td right mono bold color="#1925AA"><EditableCell value={c.coolingKw} type="number" onChange={v => updateChiller(c.id, { coolingKw: parseFloat(v) })} /></Td>
                      <Td right mono><EditableCell value={c.cop} type="number" onChange={v => updateChiller(c.id, { cop: parseFloat(v) })} /></Td>
                      <Td right mono>{inputKw.toFixed(1)}</Td>
                      <Td right mono><EditableCell value={c.chwInC} type="number" onChange={v => updateChiller(c.id, { chwInC: parseFloat(v) })} /></Td>
                      <Td right mono><EditableCell value={c.chwOutC} type="number" onChange={v => updateChiller(c.id, { chwOutC: parseFloat(v) })} /></Td>
                      <Td right mono bold>{Math.abs(chwLs).toFixed(2)}</Td>
                      <Td right mono><EditableCell value={c.cwInC} type="number" onChange={v => updateChiller(c.id, { cwInC: parseFloat(v) })} /></Td>
                      <Td right mono><EditableCell value={c.cwOutC} type="number" onChange={v => updateChiller(c.id, { cwOutC: parseFloat(v) })} /></Td>
                      <Td right mono bold color="#c44">{Math.abs(cwLs).toFixed(2)}</Td>
                      <Td><EditableCell value={c.refrigerant} onChange={v => updateChiller(c.id, { refrigerant: v })} options={['R134a', 'R32', 'R410A', 'R1234ze', 'R717 (Ammonia)']} /></Td>
                      <Td>
                        <EditableCell value={c.dutySandby} onChange={v => updateChiller(c.id, { dutySandby: v as ChillerRecord['dutySandby'] })} options={['Single', 'Duty/Standby', 'N+1']} />
                      </Td>
                      <Td><EditableCell value={c.notes} onChange={v => updateChiller(c.id, { notes: v })} /></Td>
                      <Td><button onClick={() => removeChiller(c.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button></Td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#1925AA]/20 bg-primary/5 font-bold">
                  <td colSpan={2} className="px-1.5 py-1.5 text-right text-[9px] uppercase tracking-widest text-primary">Totals</td>
                  <Td right mono bold color="#1925AA">{totalCoolingKw.toFixed(1)}</Td>
                  <Td right mono>{chillers.length > 0 ? (totalCoolingKw / (totalInputKw || 1)).toFixed(2) : '—'}</Td>
                  <Td right mono bold>{totalInputKw.toFixed(1)}</Td>
                  <td colSpan={10}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </TabsContent>

        {/* ══ COOLING TOWERS ══ */}
        <TabsContent value="ct">
          <SectionHead title="Cooling Tower Schedule" sub="Auto-generated from chiller schedule. Heat rejection = chiller cooling + compressor input." />

          <div className="border rounded-sm overflow-hidden bg-white">
            <table className="w-full text-[10px]">
              <thead className="bg-secondary/60">
                <tr>
                  <Th>Tag</Th>
                  <Th>Serves Chiller</Th>
                  <Th right>Rejection kW</Th>
                  <Th right>CW Flow L/s</Th>
                  <Th right>CW In °C</Th>
                  <Th right>CW Out °C</Th>
                  <Th right>Range °C</Th>
                  <Th right>Approach °C</Th>
                  <Th right>Fan kW</Th>
                  <Th>Duty</Th>
                  <Th>Notes</Th>
                </tr>
              </thead>
              <tbody>
                {coolingTowers.map(ct => (
                  <tr key={ct.id} className="border-t hover:bg-accent/20">
                    <Td bold color="#1925AA">{ct.tag}</Td>
                    <Td>{ct.servedByChiller}</Td>
                    <Td right mono bold color="#1925AA">{ct.capacityKw.toFixed(1)}</Td>
                    <Td right mono color="#c44">{ct.cwFlowLs.toFixed(2)}</Td>
                    <Td right mono>{ct.cwInC}</Td>
                    <Td right mono>{ct.cwOutC}</Td>
                    <Td right mono>{ct.rangeC.toFixed(1)}</Td>
                    <Td right mono>{ct.approachC.toFixed(1)}</Td>
                    <Td right mono>{ct.fanKw.toFixed(2)}</Td>
                    <Td>{ct.dutySandby}</Td>
                    <Td>{ct.notes}</Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#1925AA]/20 bg-primary/5 font-bold">
                  <td colSpan={2} className="px-1.5 py-1.5 text-right text-[9px] uppercase tracking-widest text-primary">Totals</td>
                  <Td right mono bold color="#1925AA">{coolingTowers.reduce((s, ct) => s + ct.capacityKw, 0).toFixed(1)}</Td>
                  <Td right mono bold color="#c44">{coolingTowers.reduce((s, ct) => s + ct.cwFlowLs, 0).toFixed(2)}</Td>
                  <td colSpan={5}></td>
                  <Td right mono bold>{coolingTowers.reduce((s, ct) => s + ct.fanKw, 0).toFixed(2)} kW</Td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-3 border rounded-lg p-3 bg-secondary/30 text-[10px] space-y-1">
            <div className="font-semibold text-muted-foreground uppercase tracking-wider text-[9px]">Calculation Notes</div>
            <div>Heat rejection = Chiller cooling kW + Compressor input kW</div>
            <div>CW flow = Heat rejection / (4.19 × range °C)</div>
            <div>Approach = CW leaving – WB (Sydney WB = 23°C wet season)</div>
            <div>Range = CW inlet – CW outlet (typically 6°C)</div>
            <div className="text-muted-foreground">Note: Verify approach temperature against cooling tower manufacturer curves. Typical approach = 4–6°C for induced draft towers.</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

// Mock data keyed by room ID — updated with new fields
const ROOMS: Record<string, any> = {
  r1: { tag: 'L1-01', name: 'Open Plan Office', floor: 'Level 1', area: 240, height: 3.0, orientation: 'N', facadeType: 'FT01', facadeWidth: 20, windowWidth: 16, windowHeight: 2.4, exposedRoof: 0, roofType: 'roof_other', occupants: 48, occAreaMin: 24, occCounted: 48, occSelected: 48, oaMethod: 'general', lightingW: 6, equipW: 15, equipPointLoad: 0, coolSet: 23, heatSet: 21, humMin: 40, humMax: 60, saTemp: 12, achReqSupply: 0, achReqOA: 0, infiltration: 0, subZoneTag: 'HWC-L01-01', isReheat: true, filt: 'F7', pctOA: false, isolation: false, pressure: 'Neutral', designPress: 0, system: 'AHU-01', exhaustList: [], equipList: [{ desc: 'Workstations', qty: 48, watts: 120 }, { desc: 'Printers', qty: 2, watts: 500 }] },
  r2: { tag: 'L1-02', name: 'Meeting Room A', floor: 'Level 1', area: 25, height: 3.0, orientation: 'E', facadeType: 'FT02', facadeWidth: 5, windowWidth: 3, windowHeight: 2.4, exposedRoof: 0, roofType: 'roof_other', occupants: 8, occAreaMin: 2.5, occCounted: 8, occSelected: 8, oaMethod: 'general', lightingW: 6, equipW: 10, equipPointLoad: 350, coolSet: 23, heatSet: 21, humMin: 40, humMax: 60, saTemp: 12, achReqSupply: 0, achReqOA: 0, infiltration: 0, subZoneTag: 'HWC-L01-02', isReheat: true, filt: 'F7', pctOA: false, isolation: false, pressure: 'Neutral', designPress: 0, system: 'AHU-01', exhaustList: [], equipList: [{ desc: 'AV Display', qty: 1, watts: 350 }] },
  r3: { tag: 'L1-03', name: 'General Lab', floor: 'Level 1', area: 80, height: 3.0, orientation: 'W', facadeType: 'FT01', facadeWidth: 8, windowWidth: 6, windowHeight: 2.4, exposedRoof: 0, roofType: 'roof_other', occupants: 8, occAreaMin: 8, occCounted: 8, occSelected: 8, oaMethod: 'general', lightingW: 6, equipW: 40, equipPointLoad: 0, coolSet: 23, heatSet: 21, humMin: 40, humMax: 60, saTemp: 12, achReqSupply: 8, achReqOA: 4, infiltration: 0, subZoneTag: 'HWC-L01-03', isReheat: true, filt: 'F9', pctOA: false, isolation: false, pressure: 'Negative', designPress: -15, system: 'AHU-01', exhaustList: [{ desc: 'Fume cupboard', ls: 200, type: 'Continuous' }], equipList: [{ desc: 'Lab Equipment', qty: 4, watts: 800 }] },
  r4: { tag: 'L2-01', name: 'Write-up Office', floor: 'Level 2', area: 60, height: 3.0, orientation: 'S', facadeType: 'FT02', facadeWidth: 10, windowWidth: 8, windowHeight: 2.4, exposedRoof: 0, roofType: 'roof_other', occupants: 6, occAreaMin: 6, occCounted: 6, occSelected: 6, oaMethod: 'green', lightingW: 6, equipW: 15, equipPointLoad: 0, coolSet: 23, heatSet: 21, humMin: 40, humMax: 60, saTemp: 12, achReqSupply: 0, achReqOA: 0, infiltration: 0, subZoneTag: 'HWC-L02-01', isReheat: true, filt: 'F7', pctOA: false, isolation: false, pressure: 'Neutral', designPress: 0, system: 'AHU-02', exhaustList: [], equipList: [] },
  r5: { tag: 'L8-01', name: 'Rooftop Plant Room', floor: 'Level 8', area: 120, height: 4.0, orientation: 'N', facadeType: 'FT01', facadeWidth: 12, windowWidth: 4, windowHeight: 2.0, exposedRoof: 120, roofType: 'roof_top', occupants: 0, occAreaMin: 12, occCounted: 0, occSelected: 0, oaMethod: 'general', lightingW: 6, equipW: 60, equipPointLoad: 0, coolSet: 23, heatSet: 21, humMin: 0, humMax: 0, saTemp: 12, achReqSupply: 6, achReqOA: 2, infiltration: 5, subZoneTag: '', isReheat: false, filt: 'G4', pctOA: true, isolation: false, pressure: 'Neutral', designPress: 0, system: 'AHU-03', exhaustList: [], equipList: [{ desc: 'Chillers', qty: 2, watts: 5000 }] },
};

function Field({ label, children, unit, span, hint }: { label: string; children: React.ReactNode; unit?: string; span?: number; hint?: string }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-[11px] font-medium text-muted-foreground mb-1">{label}</label>
      <div className="flex items-center gap-1">
        {children}
        {unit && <span className="text-[10px] text-muted-foreground shrink-0">{unit}</span>}
      </div>
      {hint && <div className="text-[9px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function Input({ type = 'text', defaultValue, placeholder, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`w-full h-7 px-2 border border-input bg-white text-foreground text-xs rounded-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${className}`}
      {...props}
    />
  );
}

function Select({ defaultValue, children, className = '' }: { defaultValue?: string; children: React.ReactNode; className?: string }) {
  return (
    <select defaultValue={defaultValue} className={`w-full h-7 px-2 border border-input bg-white text-foreground text-xs rounded-sm ${className}`}>
      {children}
    </select>
  );
}

function ReadOnly({ value, highlight }: { value: string | number; highlight?: boolean }) {
  return (
    <div className={`h-7 px-2 flex items-center border rounded-sm text-xs font-mono ${highlight ? 'bg-accent border-primary/20 font-bold text-primary' : 'bg-secondary border-border'}`}>
      {value}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1 mb-3 mt-6 first:mt-0">{title}</div>;
}

export default function RoomDetail() {
  const { roomId } = useParams();
  const room = ROOMS[roomId || 'r1'] || ROOMS.r1;

  const [exhaustList, setExhaustList] = useState(room.exhaustList || []);
  const [equipList, setEquipList] = useState(room.equipList || []);

  const volume = room.area * room.height;
  const windowArea = room.windowWidth * room.windowHeight;
  const facadeArea = room.facadeWidth * room.height;
  const calcOA = room.occupants * (room.oaMethod === 'green' ? 11.25 : 7.5);
  const totalEquipW = equipList.reduce((s: number, e: any) => s + e.qty * e.watts, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Room header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">{room.tag} — {room.name}</h2>
          <p className="text-xs text-muted-foreground">{room.floor} · {room.area} m² · {room.height} m · {volume} m³</p>
        </div>
        <div className="flex gap-2">
          <button className="h-7 px-3 text-xs font-medium border border-border bg-white text-foreground rounded-sm hover:bg-secondary transition-colors">Save</button>
          <button className="h-7 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-colors">Save & Next</button>
        </div>
      </div>

      {/* ─── IDENTIFICATION ─── */}
      <SectionHeader title="Identification" />
      <div className="grid grid-cols-4 gap-x-4 gap-y-3">
        <Field label="Room Tag"><Input defaultValue={room.tag} /></Field>
        <Field label="Room Name"><Input defaultValue={room.name} /></Field>
        <Field label="Room No."><Input defaultValue="1.01" placeholder="Arch. ref" /></Field>
        <Field label="Room Type">
          <Select defaultValue="General">
            <option>General</option><option>General Lab</option><option>Wet Lab</option><option>Write-up Office</option><option>GMP</option><option>L2D</option><option>Ante / Circulation</option><option>Atrium</option><option>Server Room</option><option>Kitchen</option><option>Bathroom</option>
          </Select>
        </Field>
      </div>

      {/* ─── DIMENSIONS ─── */}
      <SectionHeader title="Dimensions" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Floor Area" unit="m²"><Input type="number" defaultValue={room.area} /></Field>
        <Field label="Height" unit="m"><Input type="number" defaultValue={room.height} step="0.1" /></Field>
        <Field label="Volume" unit="m³"><ReadOnly value={volume} /></Field>
        <Field label="Served by">
          <Select defaultValue={room.system}>
            <option>AHU-01</option><option>AHU-02</option><option>AHU-03</option><option>+ New</option>
          </Select>
        </Field>
        <Field label="Sub-zone Tag" hint="e.g. HWC-L01-60">
          <Input defaultValue={room.subZoneTag} placeholder="HWC-L01-xx" />
        </Field>
      </div>

      {/* ─── FACADE ─── */}
      <SectionHeader title="Facade" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Orientation">
          <Select defaultValue={room.orientation}>
            <option>N</option><option>E</option><option>S</option><option>W</option><option>WS</option><option>S_SHD</option><option>Partition</option><option>Internal</option>
          </Select>
        </Field>
        <Field label="Facade Type">
          <Select defaultValue={room.facadeType}>
            <option value="FT01">FT01 — Std Double Glaze</option>
            <option value="FT02">FT02 — Perf Double Glaze</option>
            <option value="FT04">FT04 — With Overhang</option>
            <option value="Partition">Partition</option>
            <option value="none">Internal (none)</option>
          </Select>
        </Field>
        <Field label="Facade Width" unit="m"><Input type="number" defaultValue={room.facadeWidth} step="0.1" /></Field>
        <Field label="Facade Area" unit="m²"><ReadOnly value={facadeArea.toFixed(1)} /></Field>
        <div /> {/* spacer */}
      </div>
      <div className="grid grid-cols-5 gap-x-4 gap-y-3 mt-3">
        <Field label="Window Width" unit="m"><Input type="number" defaultValue={room.windowWidth} step="0.1" /></Field>
        <Field label="Window Height" unit="m"><Input type="number" defaultValue={room.windowHeight} step="0.1" /></Field>
        <Field label="Window Area" unit="m²"><ReadOnly value={windowArea.toFixed(1)} /></Field>
        <div className="flex flex-col gap-1.5 pt-4 col-span-2">
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" defaultChecked={room.exposedRoof > 0} className="rounded-sm" /> Has Roof Exposure</label>
        </div>
      </div>
      {room.exposedRoof > 0 && (
        <div className="grid grid-cols-5 gap-x-4 gap-y-3 mt-3">
          <Field label="Exposed Roof Area" unit="m²"><Input type="number" defaultValue={room.exposedRoof} /></Field>
          <Field label="Roof Type">
            <Select defaultValue={room.roofType}>
              <option value="roof_top">Roof L8 (U=0.238)</option>
              <option value="roof_other">Other (U=0.27)</option>
            </Select>
          </Field>
        </div>
      )}

      {/* ─── OCCUPANCY ─── */}
      <SectionHeader title="Occupancy" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Area minimum" unit="pax" hint="= area / 10">
          <ReadOnly value={room.occAreaMin} />
        </Field>
        <Field label="Counted" unit="pax"><Input type="number" defaultValue={room.occCounted} /></Field>
        <Field label="Selected (used)" unit="pax" hint="Engineer's choice">
          <Input type="number" defaultValue={room.occSelected} className="border-primary/40 bg-accent/30" />
        </Field>
        <Field label="OA Method">
          <Select defaultValue={room.oaMethod}>
            <option value="general">AS1668.2 General (7.5 L/s/p)</option>
            <option value="green">Green Star (11.25 L/s/p)</option>
            <option value="custom">Custom</option>
          </Select>
        </Field>
        <Field label="Calculated OA" unit="L/s">
          <ReadOnly value={calcOA.toFixed(0)} highlight />
        </Field>
      </div>

      {/* ─── INTERNAL LOADS ─── */}
      <SectionHeader title="Internal Loads" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Lighting" unit="W/m²"><Input type="number" defaultValue={room.lightingW} /></Field>
        <Field label="Equipment" unit="W/m²"><Input type="number" defaultValue={room.equipW} /></Field>
        <Field label="Equipment Point Load" unit="W" hint="For specific plant items">
          <Input type="number" defaultValue={room.equipPointLoad} />
        </Field>
        <Field label="Total equip (line items)" unit="W">
          <ReadOnly value={totalEquipW.toLocaleString()} />
        </Field>
        <Field label="Equipment used" unit="W" hint="max(point, W/m² × area)">
          <ReadOnly value={Math.max(room.equipPointLoad, room.equipW * room.area).toLocaleString()} highlight />
        </Field>
      </div>

      {/* Equipment line items */}
      {equipList.length > 0 && (
        <div className="mt-3 border rounded-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Description</th>
                <th className="text-right px-2 py-1.5 font-medium text-muted-foreground w-20">Qty</th>
                <th className="text-right px-2 py-1.5 font-medium text-muted-foreground w-24">Watts ea.</th>
                <th className="text-right px-2 py-1.5 font-medium text-muted-foreground w-24">Total W</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {equipList.map((item: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1"><Input defaultValue={item.desc} /></td>
                  <td className="px-2 py-1"><Input type="number" defaultValue={item.qty} className="text-right" /></td>
                  <td className="px-2 py-1"><Input type="number" defaultValue={item.watts} className="text-right" /></td>
                  <td className="px-2 py-1 text-right font-mono text-muted-foreground">{(item.qty * item.watts).toLocaleString()}</td>
                  <td className="px-1 py-1">
                    <button onClick={() => setEquipList(equipList.filter((_: any, j: number) => j !== i))} className="text-muted-foreground hover:text-destructive p-0.5"><Trash2 className="h-3 w-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={() => setEquipList([...equipList, { desc: '', qty: 1, watts: 0 }])}
        className="mt-2 flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium"
      >
        <Plus className="h-3 w-3" /> Add equipment item
      </button>

      {/* ─── SUPPLY AIR ─── */}
      <SectionHeader title="Supply Air" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="SA-T Selected" unit="°C" hint="Off-coil supply air temp">
          <Input type="number" defaultValue={room.saTemp} step="0.5" className="border-primary/40 bg-accent/30" />
        </Field>
        <Field label="ACH Required — Supply" hint="Min from code/brief">
          <Input type="number" defaultValue={room.achReqSupply} placeholder="e.g. 8" />
        </Field>
        <Field label="ACH Required — OA" hint="Min OA from AS1668.2">
          <Input type="number" defaultValue={room.achReqOA} placeholder="e.g. 4" />
        </Field>
        <Field label="Infiltration" unit="L/s" hint="0 for sealed bldgs">
          <Input type="number" defaultValue={room.infiltration} step="0.1" />
        </Field>
        <div className="flex flex-col gap-1.5 pt-4">
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" defaultChecked={room.isReheat} className="rounded-sm" /> HWC Reheat Zone
          </label>
        </div>
      </div>

      {/* ─── ENVIRONMENT ─── */}
      <SectionHeader title="Environment" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Summer Setpoint" unit="°C"><Input type="number" defaultValue={room.coolSet} /></Field>
        <Field label="Winter Setpoint" unit="°C"><Input type="number" defaultValue={room.heatSet} /></Field>
        <Field label="Min RH" unit="%"><Input type="number" defaultValue={room.humMin} /></Field>
        <Field label="Max RH" unit="%"><Input type="number" defaultValue={room.humMax} /></Field>
        <Field label="Filtration">
          <Select defaultValue={room.filt}>
            <option>G4</option><option>F7</option><option>F9</option><option>HEPA</option><option>ULPA</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-5 gap-x-4 gap-y-3 mt-3">
        <Field label="Pressure" unit="Pa">
          <Select defaultValue={room.pressure}>
            <option>Positive</option><option>Neutral</option><option>Negative</option>
          </Select>
        </Field>
        <Field label="Design Pressure" unit="Pa"><Input type="number" defaultValue={room.designPress} /></Field>
        <div className="flex flex-col gap-1.5 pt-4 col-span-2">
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" defaultChecked={room.pctOA} className="rounded-sm" /> 100% Outside Air</label>
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" defaultChecked={room.isolation} className="rounded-sm" /> Critical / Isolation</label>
        </div>
      </div>

      {/* Dedicated exhausts line items */}
      <div className="mt-4">
        <div className="text-[11px] font-medium text-muted-foreground mb-2">Dedicated Exhausts</div>
        {exhaustList.length > 0 && (
          <div className="border rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">Description</th>
                  <th className="text-right px-2 py-1.5 font-medium text-muted-foreground w-24">Flow (L/s)</th>
                  <th className="text-left px-2 py-1.5 font-medium text-muted-foreground w-28">Type</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {exhaustList.map((item: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1"><Input defaultValue={item.desc} /></td>
                    <td className="px-2 py-1"><Input type="number" defaultValue={item.ls} className="text-right" /></td>
                    <td className="px-2 py-1">
                      <Select defaultValue={item.type}>
                        <option>Continuous</option><option>Intermittent</option>
                      </Select>
                    </td>
                    <td className="px-1 py-1">
                      <button onClick={() => setExhaustList(exhaustList.filter((_: any, j: number) => j !== i))} className="text-muted-foreground hover:text-destructive p-0.5"><Trash2 className="h-3 w-3" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button
          onClick={() => setExhaustList([...exhaustList, { desc: '', ls: 0, type: 'Continuous' }])}
          className="mt-2 flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium"
        >
          <Plus className="h-3 w-3" /> Add exhaust
        </button>
      </div>

      {/* ─── NOTES ─── */}
      <SectionHeader title="Notes" />
      <textarea
        className="w-full h-16 px-2 py-1.5 border border-input bg-white text-xs rounded-sm resize-y"
        placeholder="Engineering notes, change reasons..."
      />

      {/* Spacer */}
      <div className="h-12" />
    </div>
  );
}

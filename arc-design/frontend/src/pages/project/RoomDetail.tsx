import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

// Mock data keyed by room ID
const ROOMS: Record<string, any> = {
  r1: { tag: 'L1-01', name: 'Open Plan Office', floor: 'Level 1', area: 240, height: 3.0, orientation: 'N', occupants: 48, activity: 'Seated', lightingW: 12, equipW: 15, glaze: 20, glassU: 2.8, shgc: 0.4, wallU: 0.35, extWall: true, roof: false, coolSet: 24, heatSet: 20, humMin: 40, humMax: 60, supplyAch: '', returnAch: '', exhaustAch: '', filt: 'F7', pctOA: false, isolation: false, oaMethod: 'AS1668.2', pressure: 'Neutral', lsPerson: 10, lsM2: 0.5, designPress: 0, system: 'AHU-01', exhaustList: [], equipList: [{ desc: 'Workstations', qty: 48, watts: 120 }, { desc: 'Printers', qty: 2, watts: 500 }] },
  r2: { tag: 'L1-02', name: 'Meeting Room A', floor: 'Level 1', area: 25, height: 3.0, orientation: 'E', occupants: 8, activity: 'Seated', lightingW: 12, equipW: 10, glaze: 30, glassU: 2.8, shgc: 0.4, wallU: 0.35, extWall: true, roof: false, coolSet: 24, heatSet: 20, humMin: 40, humMax: 60, supplyAch: '', returnAch: '', exhaustAch: '', filt: 'F7', pctOA: false, isolation: false, oaMethod: 'AS1668.2', pressure: 'Neutral', lsPerson: 10, lsM2: 0.5, designPress: 0, system: 'AHU-01', exhaustList: [], equipList: [{ desc: 'AV Display', qty: 1, watts: 350 }] },
  r3: { tag: 'L1-03', name: 'Server Room', floor: 'Level 1', area: 18, height: 3.0, orientation: 'Internal', occupants: 0, activity: 'None', lightingW: 8, equipW: 0, glaze: 0, glassU: 0, shgc: 0, wallU: 0.35, extWall: false, roof: false, coolSet: 22, heatSet: 18, humMin: 40, humMax: 55, supplyAch: '15', returnAch: '', exhaustAch: '', filt: 'F9', pctOA: false, isolation: false, oaMethod: 'Custom', pressure: 'Positive', lsPerson: 0, lsM2: 0, designPress: 10, system: 'FCU-L1-01', exhaustList: [], equipList: [{ desc: 'Server Racks', qty: 4, watts: 2500 }] },
  r4: { tag: 'L1-04', name: 'Toilet Block', floor: 'Level 1', area: 30, height: 3.0, orientation: 'Internal', occupants: 0, activity: 'None', lightingW: 8, equipW: 2, glaze: 0, glassU: 0, shgc: 0, wallU: 0.35, extWall: false, roof: false, coolSet: 24, heatSet: 20, humMin: 0, humMax: 0, supplyAch: '', returnAch: '', exhaustAch: '10', filt: 'G4', pctOA: false, isolation: false, oaMethod: 'ACH', pressure: 'Negative', lsPerson: 0, lsM2: 0, designPress: -15, system: 'EXH-01', exhaustList: [{ desc: 'Toilet exhaust', ls: 120, type: 'Continuous' }], equipList: [{ desc: 'Hand dryers', qty: 2, watts: 1800 }] },
  r5: { tag: 'L1-05', name: 'Reception', floor: 'Level 1', area: 60, height: 4.5, orientation: 'NE', occupants: 6, activity: 'Seated', lightingW: 15, equipW: 10, glaze: 40, glassU: 2.8, shgc: 0.4, wallU: 0.35, extWall: true, roof: false, coolSet: 24, heatSet: 20, humMin: 40, humMax: 60, supplyAch: '', returnAch: '', exhaustAch: '', filt: 'F7', pctOA: false, isolation: false, oaMethod: 'AS1668.2', pressure: 'Positive', lsPerson: 10, lsM2: 0.5, designPress: 5, system: 'AHU-01', exhaustList: [], equipList: [] },
  r6: { tag: 'L1-06', name: 'Kitchen', floor: 'Level 1', area: 35, height: 3.0, orientation: 'S', occupants: 12, activity: 'Light Work', lightingW: 12, equipW: 25, glaze: 10, glassU: 2.8, shgc: 0.4, wallU: 0.35, extWall: true, roof: false, coolSet: 24, heatSet: 20, humMin: 0, humMax: 0, supplyAch: '', returnAch: '', exhaustAch: '12', filt: 'G4', pctOA: false, isolation: false, oaMethod: 'AS1668.2', pressure: 'Negative', lsPerson: 10, lsM2: 1.0, designPress: -10, system: 'AHU-01', exhaustList: [{ desc: 'Kitchen hood', ls: 150, type: 'Intermittent' }], equipList: [{ desc: 'Dishwasher', qty: 1, watts: 2400 }, { desc: 'Microwave', qty: 2, watts: 1000 }, { desc: 'Fridge', qty: 1, watts: 200 }] },
  r7: { tag: 'L2-01', name: 'Open Plan Office', floor: 'Level 2', area: 280, height: 3.0, orientation: 'N', occupants: 56, activity: 'Seated', lightingW: 12, equipW: 15, glaze: 20, glassU: 2.8, shgc: 0.4, wallU: 0.35, extWall: true, roof: false, coolSet: 24, heatSet: 20, humMin: 40, humMax: 60, supplyAch: '', returnAch: '', exhaustAch: '', filt: 'F7', pctOA: false, isolation: false, oaMethod: 'AS1668.2', pressure: 'Neutral', lsPerson: 10, lsM2: 0.5, designPress: 0, system: 'AHU-02', exhaustList: [], equipList: [{ desc: 'Workstations', qty: 56, watts: 120 }] },
  r8: { tag: 'L2-02', name: 'Conference Room', floor: 'Level 2', area: 45, height: 3.0, orientation: 'E', occupants: 20, activity: 'Seated', lightingW: 12, equipW: 10, glaze: 25, glassU: 2.8, shgc: 0.4, wallU: 0.35, extWall: true, roof: false, coolSet: 24, heatSet: 20, humMin: 40, humMax: 60, supplyAch: '', returnAch: '', exhaustAch: '', filt: 'F7', pctOA: false, isolation: false, oaMethod: 'AS1668.2', pressure: 'Neutral', lsPerson: 10, lsM2: 0.5, designPress: 0, system: 'AHU-02', exhaustList: [], equipList: [{ desc: 'Projector', qty: 1, watts: 450 }] },
  r9: { tag: 'L2-03', name: 'Director Suite', floor: 'Level 2', area: 30, height: 3.0, orientation: 'N', occupants: 2, activity: 'Seated', lightingW: 12, equipW: 10, glaze: 35, glassU: 2.8, shgc: 0.4, wallU: 0.35, extWall: true, roof: false, coolSet: 23, heatSet: 21, humMin: 40, humMax: 60, supplyAch: '6', returnAch: '', exhaustAch: '', filt: 'F7', pctOA: false, isolation: false, oaMethod: 'AS1668.2', pressure: 'Positive', lsPerson: 10, lsM2: 0.5, designPress: 5, system: 'AHU-02', exhaustList: [], equipList: [] },
  r10: { tag: 'L2-04', name: 'Print Room', floor: 'Level 2', area: 20, height: 3.0, orientation: 'Internal', occupants: 0, activity: 'None', lightingW: 10, equipW: 0, glaze: 0, glassU: 0, shgc: 0, wallU: 0.35, extWall: false, roof: false, coolSet: 24, heatSet: 20, humMin: 0, humMax: 0, supplyAch: '', returnAch: '', exhaustAch: '', filt: 'G4', pctOA: false, isolation: false, oaMethod: 'AS1668.2', pressure: 'Negative', lsPerson: 0, lsM2: 0, designPress: -10, system: 'AHU-02', exhaustList: [{ desc: 'Print room exhaust', ls: 200, type: 'Continuous' }], equipList: [{ desc: 'Laser Printers', qty: 3, watts: 800 }, { desc: 'Copier', qty: 1, watts: 1500 }] },
};

function Field({ label, children, unit, span }: { label: string; children: React.ReactNode; unit?: string; span?: number }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-[11px] font-medium text-muted-foreground mb-1">{label}</label>
      <div className="flex items-center gap-1">
        {children}
        {unit && <span className="text-[10px] text-muted-foreground shrink-0">{unit}</span>}
      </div>
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

function SectionHeader({ title }: { title: string }) {
  return <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1 mb-3 mt-6 first:mt-0">{title}</div>;
}

export default function RoomDetail() {
  const { roomId } = useParams();
  const room = ROOMS[roomId || 'r1'] || ROOMS.r1;

  const [exhaustList, setExhaustList] = useState(room.exhaustList || []);
  const [equipList, setEquipList] = useState(room.equipList || []);

  const calcOA = room.occupants * room.lsPerson + room.area * room.lsM2;
  const volume = room.area * room.height;

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
            <option>General</option><option>Server Room</option><option>Kitchen</option><option>Bathroom</option><option>Lab</option><option>Theatre</option><option>Carpark</option>
          </Select>
        </Field>
      </div>

      {/* ─── DIMENSIONS & ENVELOPE ─── */}
      <SectionHeader title="Dimensions & Envelope" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Floor Area" unit="m²"><Input type="number" defaultValue={room.area} /></Field>
        <Field label="Height" unit="m"><Input type="number" defaultValue={room.height} step="0.1" /></Field>
        <Field label="Volume" unit="m³">
          <div className="h-7 px-2 flex items-center bg-secondary border border-border rounded-sm text-xs font-mono">{volume}</div>
        </Field>
        <Field label="Orientation">
          <Select defaultValue={room.orientation}>
            <option>N</option><option>NE</option><option>E</option><option>SE</option><option>S</option><option>SW</option><option>W</option><option>NW</option><option>Internal</option>
          </Select>
        </Field>
        <Field label="Served by">
          <Select defaultValue={room.system}>
            <option>AHU-01</option><option>AHU-02</option><option>FCU-L1-01</option><option>EXH-01</option><option>+ New</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-5 gap-x-4 gap-y-3 mt-3">
        <Field label="Glazing" unit="%"><Input type="number" defaultValue={room.glaze} /></Field>
        <Field label="Glass U" unit="W/m²K"><Input type="number" defaultValue={room.glassU} step="0.1" /></Field>
        <Field label="SHGC"><Input type="number" defaultValue={room.shgc} step="0.05" /></Field>
        <Field label="Wall U" unit="W/m²K"><Input type="number" defaultValue={room.wallU} step="0.05" /></Field>
        <div className="flex flex-col gap-1.5 pt-4">
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" defaultChecked={room.extWall} className="rounded-sm" /> Ext. wall</label>
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" defaultChecked={room.roof} className="rounded-sm" /> Roof</label>
        </div>
      </div>

      {/* ─── INTERNAL LOADS ─── */}
      <SectionHeader title="Internal Loads" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Occupants"><Input type="number" defaultValue={room.occupants} /></Field>
        <Field label="Activity">
          <Select defaultValue={room.activity}>
            <option>None</option><option>Seated</option><option>Light Work</option><option>Standing</option><option>Heavy</option>
          </Select>
        </Field>
        <Field label="Lighting" unit="W/m²"><Input type="number" defaultValue={room.lightingW} /></Field>
        <Field label="Equipment" unit="W/m²"><Input type="number" defaultValue={room.equipW} /></Field>
        <Field label="Total equip" unit="W">
          <div className="h-7 px-2 flex items-center bg-secondary border border-border rounded-sm text-xs font-mono">
            {equipList.reduce((s: number, e: any) => s + e.qty * e.watts, 0).toLocaleString()}
          </div>
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

      {/* ─── ENVIRONMENT ─── */}
      <SectionHeader title="Environment" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Cooling setpoint" unit="°C"><Input type="number" defaultValue={room.coolSet} /></Field>
        <Field label="Heating setpoint" unit="°C"><Input type="number" defaultValue={room.heatSet} /></Field>
        <Field label="Min RH" unit="%"><Input type="number" defaultValue={room.humMin} /></Field>
        <Field label="Max RH" unit="%"><Input type="number" defaultValue={room.humMax} /></Field>
        <Field label="Filtration">
          <Select defaultValue={room.filt}>
            <option>G4</option><option>F7</option><option>F9</option><option>HEPA</option><option>ULPA</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-5 gap-x-4 gap-y-3 mt-3">
        <Field label="Supply ACH" unit="ACH"><Input type="number" defaultValue={room.supplyAch} placeholder="—" /></Field>
        <Field label="Return ACH" unit="ACH"><Input type="number" defaultValue={room.returnAch} placeholder="—" /></Field>
        <Field label="Exhaust ACH" unit="ACH"><Input type="number" defaultValue={room.exhaustAch} placeholder="—" /></Field>
        <div className="flex flex-col gap-1.5 pt-4 col-span-2">
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" defaultChecked={room.pctOA} className="rounded-sm" /> 100% Outside Air</label>
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" defaultChecked={room.isolation} className="rounded-sm" /> Critical / Isolation</label>
        </div>
      </div>

      {/* ─── VENTILATION ─── */}
      <SectionHeader title="Ventilation & Pressure" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="OA Method">
          <Select defaultValue={room.oaMethod}>
            <option>AS1668.2</option><option>ASHRAE 62.1</option><option>ACH</option><option>L/s/m²</option><option>Custom</option>
          </Select>
        </Field>
        <Field label="L/s per person" unit="L/s"><Input type="number" defaultValue={room.lsPerson} /></Field>
        <Field label="L/s per m²" unit="L/s"><Input type="number" defaultValue={room.lsM2} step="0.1" /></Field>
        <Field label="Calculated OA" unit="L/s">
          <div className="h-7 px-2 flex items-center bg-accent border border-primary/20 rounded-sm text-xs font-mono font-bold text-primary">
            {calcOA.toFixed(0)}
          </div>
        </Field>
        <Field label="Pressure" unit="Pa">
          <Select defaultValue={room.pressure}>
            <option>Positive</option><option>Neutral</option><option>Negative</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-5 gap-x-4 gap-y-3 mt-3">
        <Field label="Design Pressure" unit="Pa"><Input type="number" defaultValue={room.designPress} /></Field>
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

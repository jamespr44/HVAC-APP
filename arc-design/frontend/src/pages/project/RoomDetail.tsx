import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useZoneStore, ZoneInputs } from '@/store/zoneStore';

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

function Input({ type = 'text', value, placeholder, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      className={`w-full h-7 px-2 border border-input bg-white text-foreground text-xs rounded-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${className}`}
      {...props}
    />
  );
}

function Select({ value, onChange, children, className = '' }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; className?: string }) {
  return (
    <select value={value} onChange={onChange} className={`w-full h-7 px-2 border border-input bg-white text-foreground text-xs rounded-sm ${className}`}>
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

function roomParamToZoneId(roomId?: string): string | undefined {
  if (!roomId) return undefined;
  if (/^r\d+$/i.test(roomId)) return roomId.slice(1);
  return roomId;
}

function numberFromInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function RoomDetail() {
  const { roomId } = useParams();
  const { zones, updateZone } = useZoneStore();

  const zone = useMemo(() => {
    const mappedZoneId = roomParamToZoneId(roomId);
    return zones.find((z) => z.inputs.id === mappedZoneId) ?? zones[0];
  }, [zones, roomId]);

  if (!zone) {
    return <div className="max-w-4xl mx-auto p-6 text-sm text-muted-foreground">No zones available.</div>;
  }

  const z = zone.inputs;
  const volume = z.areaM2 * z.heightM;
  const windowArea = z.windowWidthM * z.windowHeightM;
  const facadeArea = z.facadeWidthM * z.heightM;
  const oaRate = z.oaMethod === 'green' ? 11.25 : z.oaMethod === 'custom' ? (z.customOaLsPerPerson ?? 7.5) : 7.5;
  const calcOA = z.occupants * oaRate;

  function set<K extends keyof ZoneInputs>(key: K, value: ZoneInputs[K]) {
    updateZone(z.id, { [key]: value });
  }

  function setNum<K extends keyof ZoneInputs>(key: K, value: string) {
    set(key, numberFromInput(value) as ZoneInputs[K]);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">{z.tag} — {z.name}</h2>
          <p className="text-xs text-muted-foreground">{z.floor} · {z.areaM2} m² · {z.heightM} m · {volume.toFixed(1)} m³</p>
        </div>
      </div>

      <SectionHeader title="Identification" />
      <div className="grid grid-cols-4 gap-x-4 gap-y-3">
        <Field label="Room Tag"><Input value={z.tag} onChange={(e) => set('tag', e.target.value)} /></Field>
        <Field label="Room Name"><Input value={z.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Floor"><Input value={z.floor} onChange={(e) => set('floor', e.target.value)} /></Field>
        <Field label="AHU / System"><Input value={z.ahuTag} onChange={(e) => set('ahuTag', e.target.value)} /></Field>
      </div>

      <SectionHeader title="Dimensions" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Floor Area" unit="m²"><Input type="number" value={z.areaM2} onChange={(e) => setNum('areaM2', e.target.value)} /></Field>
        <Field label="Height" unit="m"><Input type="number" value={z.heightM} step="0.1" onChange={(e) => setNum('heightM', e.target.value)} /></Field>
        <Field label="Volume" unit="m³"><ReadOnly value={volume.toFixed(1)} /></Field>
        <Field label="Sub-zone Tag"><Input value={z.subZoneTag} onChange={(e) => set('subZoneTag', e.target.value)} /></Field>
      </div>

      <SectionHeader title="Facade" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Orientation">
          <Select value={z.facadeOrientation} onChange={(e) => set('facadeOrientation', e.target.value)}>
            <option>N</option><option>E</option><option>S</option><option>W</option><option>WS</option><option>S_SHD</option><option>Partition</option><option>Internal</option>
          </Select>
        </Field>
        <Field label="Facade Type">
          <Select value={z.facadeType} onChange={(e) => set('facadeType', e.target.value)}>
            <option value="FT01">FT01 — Std Double Glaze</option>
            <option value="FT02">FT02 — Perf Double Glaze</option>
            <option value="FT04">FT04 — With Overhang</option>
            <option value="Partition">Partition</option>
            <option value="none">Internal (none)</option>
          </Select>
        </Field>
        <Field label="Facade Width" unit="m"><Input type="number" value={z.facadeWidthM} step="0.1" onChange={(e) => setNum('facadeWidthM', e.target.value)} /></Field>
        <Field label="Facade Area" unit="m²"><ReadOnly value={facadeArea.toFixed(1)} /></Field>
      </div>
      <div className="grid grid-cols-5 gap-x-4 gap-y-3 mt-3">
        <Field label="Window Width" unit="m"><Input type="number" value={z.windowWidthM} step="0.1" onChange={(e) => setNum('windowWidthM', e.target.value)} /></Field>
        <Field label="Window Height" unit="m"><Input type="number" value={z.windowHeightM} step="0.1" onChange={(e) => setNum('windowHeightM', e.target.value)} /></Field>
        <Field label="Window Area" unit="m²"><ReadOnly value={windowArea.toFixed(1)} /></Field>
        <div className="flex flex-col gap-1.5 pt-4 col-span-2">
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={z.hasRoof} onChange={(e) => set('hasRoof', e.target.checked)} className="rounded-sm" /> Has Roof Exposure
          </label>
        </div>
      </div>
      {z.hasRoof && (
        <div className="grid grid-cols-5 gap-x-4 gap-y-3 mt-3">
          <Field label="Exposed Roof Area" unit="m²"><Input type="number" value={z.exposedRoofAreaM2} onChange={(e) => setNum('exposedRoofAreaM2', e.target.value)} /></Field>
          <Field label="Roof Type">
            <Select value={z.roofType} onChange={(e) => set('roofType', e.target.value)}>
              <option value="roof_top">Roof L8 (U=0.238)</option>
              <option value="roof_other">Other (U=0.27)</option>
            </Select>
          </Field>
        </div>
      )}

      <SectionHeader title="Occupancy" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Selected Occupancy" unit="pax"><Input type="number" value={z.occupants} onChange={(e) => setNum('occupants', e.target.value)} /></Field>
        <Field label="OA Method">
          <Select value={z.oaMethod} onChange={(e) => set('oaMethod', e.target.value as ZoneInputs['oaMethod'])}>
            <option value="general">AS1668.2 General (7.5 L/s/p)</option>
            <option value="green">Green Star (11.25 L/s/p)</option>
            <option value="custom">Custom</option>
          </Select>
        </Field>
        <Field label="Calculated OA" unit="L/s"><ReadOnly value={calcOA.toFixed(0)} highlight /></Field>
      </div>

      <SectionHeader title="Internal Loads" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Lighting" unit="W/m²"><Input type="number" value={z.lightingWm2} onChange={(e) => setNum('lightingWm2', e.target.value)} /></Field>
        <Field label="Equipment" unit="W/m²"><Input type="number" value={z.equipmentWm2} onChange={(e) => setNum('equipmentWm2', e.target.value)} /></Field>
        <Field label="Equipment Point Load" unit="W"><Input type="number" value={z.equipmentPointLoadW} onChange={(e) => setNum('equipmentPointLoadW', e.target.value)} /></Field>
      </div>

      <SectionHeader title="Supply Air" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="SA-T Selected" unit="°C"><Input type="number" value={z.saTemperatureC} step="0.5" onChange={(e) => setNum('saTemperatureC', e.target.value)} /></Field>
        <Field label="ACH Required — Supply"><Input type="number" value={z.achRequiredSupply} onChange={(e) => setNum('achRequiredSupply', e.target.value)} /></Field>
        <Field label="ACH Required — OA"><Input type="number" value={z.achRequiredOA} onChange={(e) => setNum('achRequiredOA', e.target.value)} /></Field>
        <Field label="Infiltration" unit="L/s"><Input type="number" value={z.infiltrationLs} step="0.1" onChange={(e) => setNum('infiltrationLs', e.target.value)} /></Field>
        <div className="flex flex-col gap-1.5 pt-4">
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={z.isHWCReheatZone} onChange={(e) => set('isHWCReheatZone', e.target.checked)} className="rounded-sm" /> HWC Reheat Zone
          </label>
        </div>
      </div>

      <SectionHeader title="Environment" />
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        <Field label="Summer Setpoint" unit="°C"><Input type="number" value={z.summerRoomTempC} onChange={(e) => setNum('summerRoomTempC', e.target.value)} /></Field>
        <Field label="Winter Setpoint" unit="°C"><Input type="number" value={z.winterRoomTempC} onChange={(e) => setNum('winterRoomTempC', e.target.value)} /></Field>
      </div>

      <div className="h-12" />
    </div>
  );
}

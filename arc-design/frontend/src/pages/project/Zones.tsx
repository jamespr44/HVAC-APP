import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const MOCK_ZONES = [
  { id: '1', tag: 'Z-L1-01', name: 'Open Plan Office', area: 240, height: 3.0, occupants: 48, cooling: 18.4, supply: 485, orientation: 'N', stale: false },
  { id: '2', tag: 'Z-L1-02', name: 'Meeting Room A', area: 25, height: 3.0, occupants: 8, cooling: 3.1, supply: 65, orientation: 'E', stale: true },
  { id: '3', tag: 'Z-L1-03', name: 'Server Room', area: 18, height: 3.0, occupants: 0, cooling: 12.5, supply: 280, orientation: 'Internal', stale: false },
  { id: '4', tag: 'Z-L1-04', name: 'Toilet Block', area: 30, height: 3.0, occupants: 0, cooling: 1.2, supply: 0, orientation: 'Internal', stale: false },
  { id: '5', tag: 'Z-L1-05', name: 'Reception & Lobby', area: 60, height: 4.5, occupants: 6, cooling: 5.8, supply: 145, orientation: 'NE', stale: false },
  { id: '6', tag: 'Z-L1-06', name: 'Kitchen / Breakroom', area: 35, height: 3.0, occupants: 12, cooling: 4.2, supply: 110, orientation: 'S', stale: true },
];

export default function Zones() {
  const [selectedZone, setSelectedZone] = useState(MOCK_ZONES[0]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Zone List */}
        <div className="col-span-1 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Zones</h2>
            <Button className="h-7 text-xs px-2">+ Add</Button>
          </div>
          {MOCK_ZONES.map(zone => (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`rounded-lg p-3 cursor-pointer transition-all duration-150 border ${
                selectedZone.id === zone.id
                  ? 'bg-primary/5 border-primary/30 shadow-sm'
                  : 'border-transparent hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{zone.tag}</span>
                {zone.stale && <span className="h-2 w-2 rounded-full bg-yellow-400" title="Stale calc" />}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{zone.name}</div>
              <div className="mt-1.5 text-xs font-medium font-mono text-blue-600">
                {zone.cooling} kW · {zone.supply} L/s
              </div>
            </div>
          ))}
        </div>

        {/* Main Form Area */}
        <div className="col-span-3">
          <Card>
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedZone.tag} — {selectedZone.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedZone.area} m² · {selectedZone.height} m · {selectedZone.orientation}
                    {selectedZone.stale && (
                      <span className="ml-2 inline-flex items-center gap-1 text-yellow-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> Recalculate needed
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-transparent text-foreground border shadow-sm hover:bg-accent text-sm h-8">Save</Button>
                  <Button className="text-sm h-8">Save & Add Next</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="details">Details & Envelope</TabsTrigger>
                  <TabsTrigger value="env">Environment</TabsTrigger>
                  <TabsTrigger value="vent">Ventilation</TabsTrigger>
                </TabsList>

                {/* Tab 1: Details */}
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <Label>Zone Name</Label>
                      <Input defaultValue={selectedZone.name} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tag</Label>
                      <Input defaultValue={selectedZone.tag} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Room No.</Label>
                      <Input defaultValue="1.01" placeholder="Architect's room number" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Zone Type</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option>General</option>
                        <option>Server Room</option>
                        <option>Kitchen</option>
                        <option>Bathroom</option>
                        <option>Lab</option>
                        <option>Theatre</option>
                        <option>Carpark</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Dimensions</h3>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                      <div className="space-y-1.5">
                        <Label>Floor Area (m²)</Label>
                        <Input type="number" defaultValue={selectedZone.area} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Height (m)</Label>
                        <Input type="number" defaultValue={selectedZone.height} step="0.1" />
                      </div>
                      <div className="space-y-1.5 flex flex-col justify-center">
                        <Label className="text-xs text-muted-foreground">Volume</Label>
                        <div className="font-mono text-sm font-medium">{selectedZone.area * selectedZone.height} m³</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Orientation & Facade</h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'Internal'].map(dir => (
                        <button
                          key={dir}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                            selectedZone.orientation === dir
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                          }`}
                        >
                          {dir}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" /> Has external wall
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" /> Has roof exposure
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Glazing & Envelope</h3>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                      <div className="space-y-1.5">
                        <Label>Glazing (%)</Label>
                        <Input type="number" defaultValue="20" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Glass U (W/m²K)</Label>
                        <Input type="number" defaultValue="2.8" step="0.1" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>SHGC</Label>
                        <Input type="number" defaultValue="0.4" step="0.05" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Wall U (W/m²K)</Label>
                        <Input type="number" defaultValue="0.35" step="0.05" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Internal Loads</h3>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                      <div className="space-y-1.5">
                        <Label>Occupants</Label>
                        <Input type="number" defaultValue={selectedZone.occupants} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Activity</Label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <option>Seated</option>
                          <option>Light Work</option>
                          <option>Standing</option>
                          <option>Heavy</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Lighting (W/m²)</Label>
                        <Input type="number" defaultValue="12" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Equipment (W/m²)</Label>
                        <Input type="number" defaultValue="15" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Environment */}
                <TabsContent value="env" className="space-y-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <Label>Cooling Setpoint (°C)</Label>
                      <Input type="number" defaultValue="24" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Heating Setpoint (°C)</Label>
                      <Input type="number" defaultValue="20" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Min Humidity (%RH)</Label>
                      <Input type="number" defaultValue="40" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Max Humidity (%RH)</Label>
                      <Input type="number" defaultValue="60" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">ACH Override (optional — overrides load-based supply if higher)</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <Label>Supply ACH</Label>
                        <Input type="number" placeholder="e.g. 6" />
                        <div className="text-xs text-muted-foreground font-mono mt-1">→ {(6 * selectedZone.area * selectedZone.height / 3.6).toFixed(0)} L/s</div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Return ACH</Label>
                        <Input type="number" placeholder="e.g. 5" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Exhaust ACH</Label>
                        <Input type="number" placeholder="e.g. 2" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Filtration & Special</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <div className="space-y-1.5">
                        <Label>Filtration Class</Label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <option>G4</option>
                          <option selected>F7</option>
                          <option>F9</option>
                          <option>HEPA</option>
                          <option>ULPA</option>
                        </select>
                      </div>
                      <div className="space-y-4 pt-5">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" /> 100% Outside Air (no recirc)
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" /> Critical / Isolation space
                        </label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Ventilation */}
                <TabsContent value="vent" className="space-y-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <Label>OA Method</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option>ASHRAE 62.1 / AS 1668.2</option>
                        <option>ACH</option>
                        <option>L/s/m²</option>
                        <option>Custom</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pressure Regime</Label>
                      <div className="flex gap-2 pt-1">
                        {['Positive (+)', 'Neutral (0)', 'Negative (−)'].map(regime => (
                          <button key={regime} className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                            regime === 'Neutral (0)' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'
                          }`}>{regime}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>L/s per Person</Label>
                      <Input type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>L/s per m²</Label>
                      <Input type="number" defaultValue="0.5" step="0.1" />
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg bg-muted/30">
                    <Label className="text-xs text-muted-foreground">Calculated OA</Label>
                    <div className="font-mono text-lg font-bold text-primary mt-1">
                      {(selectedZone.occupants * 10 + selectedZone.area * 0.5).toFixed(0)} L/s
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      = ({selectedZone.occupants} pax × 10 L/s) + ({selectedZone.area} m² × 0.5 L/s/m²)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <Label>Dedicated Exhaust (L/s)</Label>
                      <Input type="number" placeholder="Toilets, kitchens, lab hoods..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Design Pressure (Pa)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-x-6">
                      <div className="space-y-1.5">
                        <Label>Served by System</Label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <option>AHU-01</option>
                          <option>AHU-02</option>
                          <option>FCU-L1-01</option>
                          <option>+ New System</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Change Reason</Label>
                        <Input placeholder="e.g. Updated OA per AS 1668.2 review" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const MOCK_ZONES = [
  { id: '1', tag: 'L1-01', name: 'Open Plan Office', area: 240, height: 3.0, occupants: 48, sensibleW: 12965, supplyLs: 975, orientation: 'N', facadeType: 'FT01', stale: false },
  { id: '2', tag: 'L1-02', name: 'Meeting Room A', area: 25, height: 3.0, occupants: 8, sensibleW: 1890, supplyLs: 145, orientation: 'E', facadeType: 'FT02', stale: true },
  { id: '3', tag: 'L1-03', name: 'General Lab', area: 80, height: 3.0, occupants: 8, sensibleW: 5996, supplyLs: 535, orientation: 'W', facadeType: 'FT01', stale: false },
  { id: '4', tag: 'L2-01', name: 'Write-up Office', area: 60, height: 3.0, occupants: 6, sensibleW: 2977, supplyLs: 225, orientation: 'S', facadeType: 'FT02', stale: false },
  { id: '5', tag: 'L8-01', name: 'Rooftop Plant Room', area: 120, height: 4.0, occupants: 0, sensibleW: 8500, supplyLs: 200, orientation: 'N', facadeType: 'FT01', stale: true },
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
                {(zone.sensibleW / 1000).toFixed(1)} kW · {zone.supplyLs} L/s
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {zone.orientation} · {zone.facadeType} · {zone.area} m²
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
                    {selectedZone.area} m² · {selectedZone.height} m · {selectedZone.orientation} · {selectedZone.facadeType}
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
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="details">Details & Facade</TabsTrigger>
                  <TabsTrigger value="loads">Internal Loads</TabsTrigger>
                  <TabsTrigger value="supply">Supply Air</TabsTrigger>
                  <TabsTrigger value="env">Environment</TabsTrigger>
                </TabsList>

                {/* Tab 1: Details & Facade */}
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
                        <option>General</option><option>General Lab</option><option>Wet Lab</option><option>Write-up Office</option><option>GMP</option><option>L2D</option><option>Ante / Circulation</option><option>Atrium</option>
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
                    <h3 className="text-sm font-semibold mb-3">Facade</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <div className="space-y-1.5">
                        <Label>Orientation</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {['N', 'E', 'S', 'W', 'WS', 'S_SHD', 'Partition', 'Internal'].map(dir => (
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
                      </div>
                      <div className="space-y-1.5">
                        <Label>Facade Type</Label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <option value="FT01">FT01 — Standard Double Glaze (U=3.23, SHGC=0.197)</option>
                          <option value="FT02">FT02 — Performance Double Glaze (U=2.20, SHGC=0.240)</option>
                          <option value="FT04">FT04 — With Overhang (U=2.33, SHGC=0.220)</option>
                          <option value="Partition">Partition (internal)</option>
                          <option value="none">Internal (no facade)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-4 mt-4">
                      <div className="space-y-1.5">
                        <Label>Facade Width (m)</Label>
                        <Input type="number" defaultValue="10" step="0.1" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Window Width (m)</Label>
                        <Input type="number" defaultValue="8" step="0.1" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Window Height (m)</Label>
                        <Input type="number" defaultValue="2.4" step="0.1" />
                      </div>
                      <div className="space-y-1.5 flex flex-col justify-center">
                        <Label className="text-xs text-muted-foreground">Window Area</Label>
                        <div className="font-mono text-sm font-medium">19.2 m²</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-3 mt-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" /> Has roof exposure
                      </label>
                      <div className="space-y-1.5">
                        <Label>Exposed Roof Area (m²)</Label>
                        <Input type="number" defaultValue="0" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Roof Type</Label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <option value="roof_top">Roof L8 (U=0.238)</option>
                          <option value="roof_other">Other (U=0.27)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Internal Loads */}
                <TabsContent value="loads" className="space-y-6">
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Occupancy</h3>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                      <div className="space-y-1.5">
                        <Label>Area minimum (pax)</Label>
                        <div className="font-mono text-sm font-medium px-3 py-2 bg-muted rounded-md">{Math.floor(selectedZone.area / 10)}</div>
                        <div className="text-[10px] text-muted-foreground">= area / 10</div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Counted (pax)</Label>
                        <Input type="number" defaultValue={selectedZone.occupants} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Selected (used)</Label>
                        <Input type="number" defaultValue={selectedZone.occupants} className="border-primary/40 ring-1 ring-primary/20" />
                        <div className="text-[10px] text-muted-foreground">Engineer's choice</div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>OA Method</Label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <option value="general">AS1668.2 General (7.5 L/s/p)</option>
                          <option value="green">Green Star / NABERS (11.25 L/s/p)</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Lighting & Equipment</h3>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                      <div className="space-y-1.5">
                        <Label>Lighting (W/m²)</Label>
                        <Input type="number" defaultValue="6" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Equipment (W/m²)</Label>
                        <Input type="number" defaultValue="15" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Equipment Point Load (W)</Label>
                        <Input type="number" defaultValue="0" />
                        <div className="text-[10px] text-muted-foreground">For specific plant items</div>
                      </div>
                      <div className="space-y-1.5 flex flex-col justify-center">
                        <Label className="text-xs text-muted-foreground">Equipment used</Label>
                        <div className="font-mono text-sm font-medium">
                          max(0, {selectedZone.area * 15}) = <span className="text-primary font-bold">{Math.max(0, selectedZone.area * 15)} W</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">max(point load, W/m² × area)</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Supply Air */}
                <TabsContent value="supply" className="space-y-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <Label>SA-T Selected (°C)</Label>
                      <Input type="number" defaultValue="12" step="0.5" className="border-primary/40 ring-1 ring-primary/20" />
                      <div className="text-[10px] text-muted-foreground">Engineer-set off-coil supply air temperature</div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Served by System</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option>AHU-01</option><option>AHU-02</option><option>AHU-03</option><option>+ New System</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <Label>ACH Required — Supply</Label>
                      <Input type="number" placeholder="e.g. 8" defaultValue="0" />
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        → {((8 * selectedZone.area * selectedZone.height) / 3.6).toFixed(0)} L/s @ 8 ACH
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>ACH Required — OA</Label>
                      <Input type="number" placeholder="e.g. 4" defaultValue="0" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Infiltration (L/s)</Label>
                      <Input type="number" defaultValue="0" step="0.1" />
                      <div className="text-[10px] text-muted-foreground">0 for sealed buildings</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <Label>Sub-zone Tag</Label>
                      <Input placeholder="e.g. HWC-L01-60" />
                      <div className="text-[10px] text-muted-foreground">HWC = hot water coil reheat VAV</div>
                    </div>
                    <div className="space-y-4 pt-5">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" /> HWC Reheat Zone
                      </label>
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg bg-muted/30">
                    <Label className="text-xs text-muted-foreground">Calculated Supply Air</Label>
                    <div className="font-mono text-lg font-bold text-primary mt-1">
                      {selectedZone.supplyLs} L/s
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      = CEILING.MATH(max(load-based, ACH-based), 5) · OA = {Math.round(selectedZone.occupants * 7.5)} L/s ({selectedZone.occupants} pax × 7.5 L/s/p)
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                      SHF = 1.213 W/(L/s·K) · SA rounded to nearest 5 L/s
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 4: Environment */}
                <TabsContent value="env" className="space-y-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <Label>Summer Setpoint (°C)</Label>
                      <Input type="number" defaultValue="23" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Winter Setpoint (°C)</Label>
                      <Input type="number" defaultValue="21" />
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
                    <h3 className="text-sm font-semibold mb-3">Pressure & Filtration</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <div className="space-y-1.5">
                        <Label>Pressure Regime</Label>
                        <div className="flex gap-2 pt-1">
                          {['Positive (+)', 'Neutral (0)', 'Negative (-)'].map(regime => (
                            <button key={regime} className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                              regime === 'Neutral (0)' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted'
                            }`}>{regime}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Design Pressure (Pa)</Label>
                        <Input type="number" defaultValue="0" />
                      </div>
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
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

const MOCK_TREE = [
  {
    floor: 'Level 1',
    systems: [
      {
        tag: 'AHU-01', supply: 1240, oa: 380, balanced: true,
        zones: [
          { tag: 'Z-L1-01', name: 'Open Plan Office', supply: 485, oa: 55, pressure: 'NEUTRAL', type: 'supply' },
          { tag: 'Z-L1-02', name: 'Meeting Room A', supply: 65, oa: 30, pressure: 'NEUTRAL', type: 'supply' },
          { tag: 'Z-L1-03', name: 'Server Room', supply: 280, oa: 0, pressure: 'POSITIVE', type: 'supply' },
          { tag: 'Z-L1-04', name: 'Toilet Block', supply: 0, exhaust: 120, pressure: 'NEGATIVE', type: 'exhaust' },
          { tag: 'Z-L1-05', name: 'Reception & Lobby', supply: 145, oa: 45, pressure: 'POSITIVE', type: 'supply' },
          { tag: 'Z-L1-06', name: 'Kitchen / Breakroom', supply: 110, exhaust: 150, pressure: 'NEGATIVE', type: 'exhaust' },
        ]
      }
    ]
  },
  {
    floor: 'Level 2',
    systems: [
      {
        tag: 'AHU-02', supply: 980, oa: 310, balanced: false,
        zones: [
          { tag: 'Z-L2-01', name: 'Open Plan Office', supply: 520, oa: 60, pressure: 'NEUTRAL', type: 'supply' },
          { tag: 'Z-L2-02', name: 'Conference Room', supply: 180, oa: 80, pressure: 'NEUTRAL', type: 'supply' },
          { tag: 'Z-L2-03', name: 'Director Suite', supply: 140, oa: 30, pressure: 'POSITIVE', type: 'supply' },
          { tag: 'Z-L2-04', name: 'Print Room', supply: 140, exhaust: 200, pressure: 'NEGATIVE', type: 'exhaust' },
        ]
      }
    ]
  }
];

export default function Ventilation() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'Level 1': true, 'Level 2': true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Check OA balance and pressure regimes floor-by-floor.</p>
      </div>

      <div className="space-y-4">
        {MOCK_TREE.map(floor => (
          <Card key={floor.floor} className="overflow-hidden">
            <button
              onClick={() => setExpanded(prev => ({ ...prev, [floor.floor]: !prev[floor.floor] }))}
              className="w-full flex items-center gap-2 p-4 text-left font-semibold text-lg hover:bg-muted/30 transition-colors"
            >
              {expanded[floor.floor] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {floor.floor}
            </button>

            {expanded[floor.floor] && (
              <CardContent className="pt-0 space-y-4">
                {floor.systems.map(system => (
                  <div key={system.tag} className="border rounded-lg">
                    <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                      <span className="font-semibold text-sm text-primary">{system.tag}</span>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                        <span>{system.supply.toLocaleString()} L/s supply</span>
                        <span className="text-primary">{system.oa} L/s OA</span>
                        <span className="flex items-center gap-1">
                          Balance: {system.balanced ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y">
                      {system.zones.map(zone => {
                        const isNeg = zone.pressure === 'NEGATIVE';
                        const isPos = zone.pressure === 'POSITIVE';
                        return (
                          <div
                            key={zone.tag}
                            className={`flex items-center justify-between p-3 text-sm hover:bg-muted/20 transition-colors ${
                              isNeg ? 'bg-red-50/50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${isNeg ? 'text-red-500' : isPos ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                {isNeg ? '[−]' : isPos ? '[+]' : '[○]'}
                              </span>
                              <span className="font-medium">{zone.tag}</span>
                              <span className="text-muted-foreground">{zone.name}</span>
                            </div>
                            <div className="flex items-center gap-4 font-mono text-xs">
                              {zone.type === 'supply' ? (
                                <>
                                  <span>{zone.supply} L/s</span>
                                  <span className="text-primary">{zone.oa} L/s OA</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-red-500 font-medium">{(zone as any).exhaust} L/s EXH</span>
                                </>
                              )}
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                isNeg ? 'bg-red-100 text-red-600' :
                                isPos ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {zone.pressure}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

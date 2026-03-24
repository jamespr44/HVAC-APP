import { useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

const MOCK_FLOORS = [
  {
    id: 'f1', name: 'Level 1', rooms: [
      { id: 'r1', tag: 'L1-01', name: 'Open Plan Office', cooling: 18.4, supply: 485 },
      { id: 'r2', tag: 'L1-02', name: 'Meeting Room A', cooling: 3.1, supply: 65, stale: true },
      { id: 'r3', tag: 'L1-03', name: 'Server Room', cooling: 12.5, supply: 280 },
      { id: 'r4', tag: 'L1-04', name: 'Toilet Block', cooling: 1.2, exhaust: 120 },
      { id: 'r5', tag: 'L1-05', name: 'Reception', cooling: 5.8, supply: 145 },
      { id: 'r6', tag: 'L1-06', name: 'Kitchen', cooling: 4.2, supply: 110, stale: true },
    ]
  },
  {
    id: 'f2', name: 'Level 2', rooms: [
      { id: 'r7', tag: 'L2-01', name: 'Open Plan Office', cooling: 20.3, supply: 520 },
      { id: 'r8', tag: 'L2-02', name: 'Conference Room', cooling: 7.2, supply: 180 },
      { id: 'r9', tag: 'L2-03', name: 'Director Suite', cooling: 3.0, supply: 140 },
      { id: 'r10', tag: 'L2-04', name: 'Print Room', cooling: 3.8, supply: 140 },
    ]
  },
];

export default function ProjectLayout() {
  const { projectId, roomId } = useParams();
  const navigate = useNavigate();
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({ f1: true, f2: true });

  const toggleFloor = (fid: string) => {
    setExpandedFloors(prev => ({ ...prev, [fid]: !prev[fid] }));
  };

  return (
    <div className="flex h-[calc(100vh-40px)]">
      {/* Left sidebar — Level/Room tree */}
      <aside className="w-56 border-r bg-white shrink-0 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Floors & Rooms</span>
          <button className="text-muted-foreground hover:text-foreground p-0.5" title="Add Floor">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {MOCK_FLOORS.map(floor => (
            <div key={floor.id}>
              {/* Floor header */}
              <button
                onClick={() => toggleFloor(floor.id)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
              >
                {expandedFloors[floor.id] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {floor.name}
                <span className="ml-auto text-[10px] font-normal text-muted-foreground">{floor.rooms.length}</span>
              </button>

              {/* Room list */}
              {expandedFloors[floor.id] && (
                <div className="pb-1">
                  {floor.rooms.map(room => {
                    const isActive = roomId === room.id;
                    return (
                      <button
                        key={room.id}
                        onClick={() => navigate(`/projects/${projectId}/rooms/${room.id}`)}
                        className={`w-full text-left px-3 pl-7 py-1.5 text-xs transition-colors flex items-center gap-1 ${
                          isActive
                            ? 'bg-accent text-accent-foreground font-medium border-l-2 border-l-primary'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        <span className="font-mono text-[11px] w-12 shrink-0 text-muted-foreground">{room.tag}</span>
                        <span className="truncate">{room.name}</span>
                        {(room as any).stale && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                  <button className="w-full text-left px-3 pl-7 py-1.5 text-[11px] text-muted-foreground hover:text-primary hover:bg-secondary transition-colors flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Room
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="border-t px-3 py-2 text-[10px] text-muted-foreground">
          10 rooms · 2 floors
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </div>
    </div>
  );
}

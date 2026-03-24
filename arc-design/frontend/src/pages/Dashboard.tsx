import { useQuery } from '@tanstack/react-query';
import { Plus, MapPin, Building2, Thermometer } from 'lucide-react';
import { Link } from 'react-router-dom';
import DitherBackground from '@/components/ui/DitherBackground';

const MOCK_PROJECTS = [
  { id: '1', name: 'Sydney Tower — Level 12 Fitout', address: '100 Market St, Sydney NSW', climate: 'Sydney', cls: 'Class 5 — Office', floors: 3, zones: 24, cooling: 156.2, updated: '2h ago' },
  { id: '2', name: 'Melbourne Central — Retail Podium', address: 'La Trobe St, Melbourne VIC', climate: 'Melbourne', cls: 'Class 6 — Retail', floors: 2, zones: 18, cooling: 98.5, updated: '1d ago' },
  { id: '3', name: 'Canberra Hospital — Ward Block C', address: 'Yamba Dr, Garran ACT', climate: 'Canberra', cls: 'Class 9a — Healthcare', floors: 4, zones: 42, cooling: 310.8, updated: '3d ago' },
];

export default function Dashboard() {
  const { data: projects = MOCK_PROJECTS } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => MOCK_PROJECTS,
  });

  return (
    <>
      <DitherBackground />
      <div className="max-w-5xl mx-auto p-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Projects</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Select a project to begin engineering.</p>
        </div>
        <button className="h-7 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:opacity-90 flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" /> New Project
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(p => (
          <Link
            key={p.id}
            to={`/projects/${p.id}/rooms`}
            className="block border border-border/50 bg-white/80 backdrop-blur-md rounded-sm hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold leading-snug pr-2">{p.name}</h3>
                <span className="h-2 w-2 rounded-full bg-green-500 mt-1 shrink-0" />
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" />{p.address}</div>
                <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 shrink-0" />{p.cls}</div>
                <div className="flex items-center gap-1.5"><Thermometer className="h-3 w-3 shrink-0" />Climate: {p.climate}</div>
              </div>
              <div className="border-t mt-3 pt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div><span className="block text-sm font-bold text-foreground">{p.floors}</span>Floors</div>
                <div><span className="block text-sm font-bold text-foreground">{p.zones}</span>Rooms</div>
                <div><span className="block text-sm font-bold text-primary">{p.cooling}</span>kW cool</div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Updated {p.updated}</p>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </>
  );
}

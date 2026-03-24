import { Link, Outlet, useParams } from 'react-router-dom';

export default function AppLayout() {
  const { projectId } = useParams();
  const projectName = projectId === '1' ? 'Sydney Tower — Level 12 Fitout' :
                      projectId === '2' ? 'Melbourne Central — Retail Podium' :
                      projectId === '3' ? 'Canberra Hospital — Ward Block C' : null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar — compact, professional */}
      <header className="h-10 flex items-center border-b bg-white px-4 shrink-0">
        <Link to="/" className="flex items-center gap-1.5 font-bold text-sm text-primary tracking-tight">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          ARC Design
        </Link>

        {projectName && (
          <>
            <span className="mx-2 text-border">│</span>
            <span className="text-sm font-medium text-foreground truncate max-w-md">{projectName}</span>
          </>
        )}

        <div className="ml-auto flex items-center gap-3 text-xs">
          {projectName && (
            <nav className="flex items-center gap-0.5 mr-4">
              <NavTab to={`/projects/${projectId}/info`} label="Project Info" />
              <NavTab to={`/projects/${projectId}/rooms`} label="Rooms" />
              <NavTab to={`/projects/${projectId}/zones`} label="Zones" />
              <NavTab to={`/projects/${projectId}/schedule`} label="Zone Schedule" />
              <NavTab to={`/projects/${projectId}/systems`} label="Systems" />
              <NavTab to={`/projects/${projectId}/equipment`} label="Equip. Schedules" />
            </nav>
          )}
          <div className="h-6 w-6 rounded bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground border">
            JG
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

function NavTab({ to, label }: { to: string; label: string }) {
  // Simple active check via location
  const isActive = window.location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
    >
      {label}
    </Link>
  );
}

import { NavLink } from "react-router-dom";

const linkBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-200/60 transition";
const linkActive = "bg-slate-200 text-slate-900";

export default function Sidebar() {
  const navItem = ({ isActive }) =>
    isActive ? `${linkBase} ${linkActive}` : `${linkBase} text-slate-600`;

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white/70 backdrop-blur">
      <div className="p-4 border-b border-slate-200">
        <div className="text-lg font-semibold">🩺 Med Consult</div>
        <div className="text-xs text-slate-500">Doctor Panel</div>
      </div>

      <nav className="p-3 space-y-1">
        <NavLink to="/" end className={navItem}>
          <span>🏠</span> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/consultations" className={navItem}>
          <span>📋</span> <span>Consultations</span>
        </NavLink>

        <NavLink to="/notifications" className={navItem}>
          <span>🔔</span> <span>Notifications</span>
        </NavLink>

        <NavLink to="/settings" className={navItem}>
          <span>⚙️</span> <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}

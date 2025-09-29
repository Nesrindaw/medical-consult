export default function Topbar() {
  return (
    <header className="h-14 border-b border-slate-200 bg-white/70 backdrop-blur flex items-center justify-between px-4">
      <div className="font-medium">Doctor Dashboard</div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">Dr. User</span>
        <button
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          onClick={() => alert("TODO: Logout")}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

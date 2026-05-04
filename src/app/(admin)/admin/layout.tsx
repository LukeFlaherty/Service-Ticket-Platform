// Internal admin panel — middleware enforces @waveconsulting.biz domain
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="w-56 border-r bg-zinc-900 text-zinc-100 flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-zinc-700">
          ServiceFlow Admin
        </div>
        <nav className="flex-1 p-3 space-y-1 text-sm">
          <a href="/admin" className="block rounded px-3 py-2 hover:bg-zinc-800">
            Overview
          </a>
          <a href="/admin/orgs" className="block rounded px-3 py-2 hover:bg-zinc-800">
            Organizations
          </a>
          <a href="/admin/features" className="block rounded px-3 py-2 hover:bg-zinc-800">
            Feature Flags
          </a>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 bg-zinc-50">{children}</main>
    </div>
  );
}

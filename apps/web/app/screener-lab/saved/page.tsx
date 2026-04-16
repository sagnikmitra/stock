import { prisma } from "@ibo/db";

export const dynamic = "force-dynamic";

export default async function SavedScreenerBundlesPage() {
  const bundles = await prisma.watchlist.findMany({
    where: { kind: "screener_bundle" },
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Saved Screener Bundles</h1>
      <p className="text-sm text-slate-500">Stored under watchlists with kind = screener_bundle.</p>
      <div className="grid gap-3">
        {bundles.map((bundle) => (
          <div key={bundle.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{bundle.name}</p>
                <p className="text-xs text-slate-500">{bundle.description ?? "No description"}</p>
              </div>
              <p className="text-xs text-slate-500">{bundle._count.items} symbols</p>
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <button className="rounded border border-slate-300 px-2 py-1">Run Again</button>
              <button className="rounded border border-slate-300 px-2 py-1">Edit</button>
              <button className="rounded border border-red-300 px-2 py-1 text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {bundles.length === 0 ? <p className="text-sm text-slate-500">No saved bundles yet.</p> : null}
      </div>
      <p className="text-xs text-slate-500">Educational use only.</p>
    </div>
  );
}


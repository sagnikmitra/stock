import { SkeletonTable } from "../components/ui/skeleton";
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-36 rounded-lg bg-slate-200" />
      <div className="h-10 rounded-lg bg-slate-100" />
      <div className="rounded-xl border border-slate-100 bg-white p-6">
        <SkeletonTable rows={12} />
      </div>
    </div>
  );
}

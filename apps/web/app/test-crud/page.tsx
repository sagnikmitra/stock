import { prisma } from "@ibo/db";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function TestCRUDPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // 1. Prisma Read
  let prismaData = null;
  let prismaError = null;
  try {
    prismaData = await prisma.exchange.findMany({ take: 5 });
  } catch (e: any) {
    prismaError = e.message;
  }

  // 2. Supabase SDK Read
  const { data: sdkData, error: sdkError } = await supabase.from("Exchange").select("*").limit(5);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Supabase CRUD Readiness Check</h1>
      
      <section className="p-6 border rounded-xl bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className={prismaData ? "text-green-500" : "text-red-500"}>●</span>
          Prisma Integration (Direct Postgres)
        </h2>
        {prismaError ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{prismaError}</div>
        ) : (
          <pre className="p-4 bg-slate-50 rounded-lg overflow-auto max-h-48 text-xs text-slate-700">
            {JSON.stringify(prismaData, null, 2)}
          </pre>
        )}
      </section>

      <section className="p-6 border rounded-xl bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className={sdkData ? "text-green-500" : "text-red-500"}>●</span>
          Supabase SDK Integration (API Layer)
        </h2>
        {sdkError ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{sdkError.message}</div>
        ) : (
          <pre className="p-4 bg-slate-50 rounded-lg overflow-auto max-h-48 text-xs text-slate-700">
            {JSON.stringify(sdkData, null, 2)}
          </pre>
        )}
      </section>

      <div className="text-sm text-slate-500 italic">
        Both integrations are configured to use the hosted Supabase Cloud instance.
      </div>
    </div>
  );
}

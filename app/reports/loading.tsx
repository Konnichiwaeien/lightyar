import { DarkInnerHeader } from "@/components/layout/dark-inner-header";

export default function ReportsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f7f4ee]" aria-label="Загрузка отчётности" aria-busy="true">
      <DarkInnerHeader />
      <main className="mx-auto max-w-[1440px] px-6 py-20 md:px-12">
        <div className="h-3 w-32 rounded-full bg-amber-400/40 motion-safe:animate-pulse" />
        <div className="mt-10 h-24 max-w-4xl rounded-[2rem] bg-white/8 motion-safe:animate-pulse md:h-36" />
        <div className="mt-20 grid gap-8 md:grid-cols-[0.7fr_1fr]">
          <div className="h-48 rounded-[2rem] bg-white/5 motion-safe:animate-pulse" />
          <div className="h-64 rounded-[2rem] bg-white/5 motion-safe:animate-pulse" />
        </div>
      </main>
    </div>
  );
}

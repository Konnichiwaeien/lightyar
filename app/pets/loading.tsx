export default function PetsLoading() {
  return (
    <div className="min-h-screen bg-[#e8e4dc] pb-32">
      {/* Skeleton Hero */}
      <header className="bg-[#1c1c1c] text-[#f5f4f0] py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10 animate-pulse">
          <div className="space-y-4">
            <div className="h-10 sm:h-12 md:h-16 w-64 bg-white/20 rounded-2xl" />
            <div className="h-6 w-96 bg-white/10 rounded-xl" />
          </div>
          <div className="h-14 w-48 bg-amber-500/20 rounded-full" />
        </div>
      </header>

      <main className="text-[#1c1c1c] pt-12 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Controls skeleton */}
          <div className="h-24 bg-white/20 animate-pulse rounded-[2.25rem] mb-12" />

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start animate-pulse">
            {[...Array(8)].map((_, index) => {
              const isLarge = index === 0 || index === 5;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-[2rem] border border-[#1c1c1c]/5 overflow-hidden flex flex-col h-[480px] sm:h-[520px] ${
                    isLarge ? "sm:col-span-2 lg:col-span-2" : "col-span-1"
                  }`}
                >
                  {/* Photo area */}
                  <div className="h-72 w-full bg-[#1c1c1c]/5 relative shrink-0" />
                  
                  {/* Content area */}
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 gap-6 bg-white">
                    <div className="space-y-4">
                      {/* Name */}
                      <div className="h-8 w-1/2 bg-[#1c1c1c]/10 rounded-xl" />
                      {/* Gender/Age tags */}
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-amber-500/10 rounded-full" />
                        <div className="h-6 w-16 bg-[#1c1c1c]/5 rounded-full" />
                      </div>
                      {/* Excerpt */}
                      <div className="space-y-2 pt-2">
                        <div className="h-4 w-full bg-[#1c1c1c]/5 rounded-lg" />
                        <div className="h-4 w-5/6 bg-[#1c1c1c]/5 rounded-lg" />
                      </div>
                    </div>
                    {/* CTA button */}
                    <div className="h-12 w-full bg-[#1c1c1c]/5 rounded-xl mt-auto" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

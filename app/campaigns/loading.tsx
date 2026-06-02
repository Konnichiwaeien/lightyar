export default function CampaignsLoading() {
  return (
    <div className="min-h-screen bg-[#e8e4dc] pb-24">
      {/* Header Skeleton */}
      <header className="pt-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto animate-pulse space-y-4 mb-16">
          <div className="h-14 md:h-20 w-80 bg-[#1c1c1c]/10 rounded-2xl" />
          <div className="h-6 w-96 bg-[#1c1c1c]/5 rounded-xl" />
        </div>
      </header>

      <main className="text-[#1c1c1c] px-6 md:px-12 font-sans">
        <div className="max-w-[1400px] mx-auto">
          {/* Controls skeleton */}
          <div className="h-24 bg-white/20 animate-pulse rounded-[2.25rem] mb-12" />

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start animate-pulse">
            {[...Array(4)].map((_, index) => {
              const isLarge = index === 0 || index === 5;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-[2rem] border border-[#1c1c1c]/5 overflow-hidden flex flex-col h-full min-h-[460px] ${
                    isLarge ? "sm:col-span-2 lg:col-span-2" : "col-span-1"
                  }`}
                >
                  {/* Photo area */}
                  <div className={`w-full ${isLarge ? 'h-64' : 'h-48'} bg-[#1c1c1c]/5 shrink-0 relative`} />
                  
                  {/* Content area */}
                  <div className="p-6 md:p-8 flex flex-col flex-1 bg-white gap-6">
                    <div className="space-y-4">
                      {/* Pet tag */}
                      <div className="h-4 w-40 bg-amber-500/10 rounded-full" />
                      {/* Title */}
                      <div className="h-8 w-5/6 bg-[#1c1c1c]/10 rounded-xl" />
                      {/* Description */}
                      <div className="space-y-2 pt-2">
                        <div className="h-4 w-full bg-[#1c1c1c]/5 rounded-lg" />
                        <div className="h-4 w-5/6 bg-[#1c1c1c]/5 rounded-lg" />
                      </div>
                    </div>

                    {/* Progress Section skeleton */}
                    <div className="mt-auto space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <div className="h-3 w-16 bg-[#1c1c1c]/5 rounded-lg" />
                          <div className="h-6 w-24 bg-[#1c1c1c]/10 rounded-lg" />
                        </div>
                        <div className="space-y-1 text-right flex flex-col items-end">
                          <div className="h-3 w-12 bg-[#1c1c1c]/5 rounded-lg" />
                          <div className="h-5 w-20 bg-[#1c1c1c]/5 rounded-lg" />
                        </div>
                      </div>
                      
                      {/* Progress bar skeleton */}
                      <div className="w-full h-3 bg-[#e8e4dc] rounded-full overflow-hidden animate-pulse" />
                      
                      {/* Help Button skeleton */}
                      <div className="h-12 w-full bg-[#1c1c1c]/5 rounded-xl" />
                    </div>
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

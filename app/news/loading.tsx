export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-[#e8e4dc] pb-32">
      {/* Header Skeleton */}
      <header className="pt-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto animate-pulse space-y-4 mb-16">
          <div className="h-14 md:h-20 w-80 bg-[#1c1c1c]/10 rounded-2xl" />
          <div className="h-6 w-96 bg-[#1c1c1c]/5 rounded-xl" />
        </div>
      </header>

      <main className="text-[#1c1c1c] px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Controls skeleton */}
          <div className="h-24 bg-white/20 animate-pulse rounded-[2.25rem] mb-12" />

          {/* News Bento Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start animate-pulse">
            {[...Array(6)].map((_, index) => {
              const isLarge = index === 0 || index === 3;

              return (
                <div
                  key={index}
                  className={`bg-white rounded-[2rem] border border-[#1c1c1c]/5 overflow-hidden flex flex-col h-full ${
                    isLarge ? "md:col-span-2 md:flex-row min-h-[320px]" : "col-span-1 min-h-[480px]"
                  }`}
                >
                  {/* Photo area */}
                  <div
                    className={`bg-[#1c1c1c]/5 relative shrink-0 rounded-[2rem] ${
                      isLarge
                        ? "w-full h-64 sm:h-80 md:h-auto md:w-[45%]"
                        : "w-full h-72 sm:h-80"
                    }`}
                  />

                  {/* Body area */}
                  <div
                    className={`p-6 sm:p-8 flex flex-col justify-between flex-1 bg-white gap-6 ${
                      isLarge ? "sm:p-10 md:p-12 md:w-[55%]" : ""
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Date */}
                      <div className="h-4 w-24 bg-[#1c1c1c]/5 rounded-lg" />
                      {/* Title */}
                      <div className="h-8 w-5/6 bg-[#1c1c1c]/10 rounded-xl" />
                      {/* Excerpt */}
                      <div className="space-y-2 pt-2">
                        <div className="h-4 w-full bg-[#1c1c1c]/5 rounded-lg" />
                        <div className="h-4 w-5/6 bg-[#1c1c1c]/5 rounded-lg" />
                      </div>
                    </div>
                    {/* Read more button link */}
                    <div className="h-10 w-32 bg-[#1c1c1c]/5 rounded-full mt-auto" />
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

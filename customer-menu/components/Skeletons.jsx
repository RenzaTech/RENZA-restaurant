function SkeletonBar({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101620] p-3 sm:p-3.5 flex flex-row items-stretch gap-3 sm:gap-3.5 shadow-sm">
      <SkeletonBar className="w-[108px] h-[108px] sm:w-[122px] sm:h-[122px] shrink-0 rounded-xl" />
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div className="space-y-2">
          <SkeletonBar className="h-5 w-3/4 rounded-md" />
          <SkeletonBar className="h-3 w-full rounded-md" />
          <SkeletonBar className="h-3 w-4/5 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
          <SkeletonBar className="h-4.5 w-1/4 rounded-md" />
          <SkeletonBar className="h-3.5 w-1/3 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-[#05070b]">
      <div className="border-b border-white/10 bg-[#070b11]/90 px-5 pb-8 pt-10 text-center">
        <SkeletonBar className="mx-auto mb-4 h-24 w-24 rounded-[2rem]" />
        <SkeletonBar className="mx-auto mb-3 h-10 w-64 rounded-2xl" />
        <SkeletonBar className="mx-auto h-5 w-44 rounded-full" />
      </div>
      <div className="mx-auto max-w-[780px] space-y-4 px-4 py-6">
        <SkeletonBar className="h-12 w-full rounded-2xl" />
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBar key={i} className="h-9 w-24 flex-shrink-0 rounded-full" />
          ))}
        </div>
        <div className="flex flex-col gap-3.5 pt-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
function SkeletonBar({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,20,27,0.9),rgba(8,11,17,0.94))] shadow-[0_16px_30px_rgba(0,0,0,0.26)]">
      <SkeletonBar className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <SkeletonBar className="h-5 w-3/4" />
        <SkeletonBar className="h-4 w-1/3" />
        <SkeletonBar className="h-3 w-5/6" />
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
      <div className="mx-auto max-w-[1200px] space-y-4 px-4 py-6">
        <SkeletonBar className="h-12 w-full rounded-2xl" />
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBar key={i} className="h-9 w-24 flex-shrink-0 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 pt-2">
          <SkeletonCard />
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
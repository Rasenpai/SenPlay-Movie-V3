const bar = "animate-pulse rounded-md bg-surface-hover";

export default function MovieSkeleton() {
  return (
    <main aria-busy="true" aria-label="Memuat film">
      <section className="relative h-[100svh] min-h-[600px] max-h-[860px] overflow-hidden bg-surface">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/30"
        />

        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-surface-hover" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between gap-8 px-5 pb-10 md:flex-row md:items-end md:px-12">
          <div>
            <div className={`${bar} h-4 w-56`} />
            <div className={`${bar} mt-5 h-4 w-32`} />
            <div className={`${bar} mt-3 h-12 w-72 md:h-16 md:w-[28rem]`} />
            <div className={`${bar} mt-5 h-5 w-52`} />
            <div className="mt-5 flex gap-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className={`${bar} h-8 w-14`} />
                  <div className={`${bar} mt-2 h-3 w-10`} />
                </div>
              ))}
            </div>
            <div className={`${bar} mt-6 h-11 w-40 rounded-lg`} />
          </div>

          <div
            className={`${bar} hidden h-[104px] w-[380px] rounded-xl md:block`}
          />
        </div>
      </section>

      <section className="px-5 py-8 md:px-12">
        <div className="max-w-4xl space-y-3">
          <div className={`${bar} h-5 w-full`} />
          <div className={`${bar} h-5 w-4/5`} />
          <div className={`${bar} mt-4 h-4 w-full`} />
          <div className={`${bar} h-4 w-3/5`} />
        </div>
      </section>

      <section className="pb-6">
        <div className={`${bar} mx-5 mb-4 h-6 w-28 md:mx-12`} />
        <div className="flex gap-4 overflow-hidden px-5 md:px-12">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="w-32 shrink-0">
              <div className={`${bar} aspect-[3/4] w-full rounded-xl`} />
              <div className={`${bar} mt-2 h-4 w-24`} />
              <div className={`${bar} mt-1 h-3 w-16`} />
            </div>
          ))}
        </div>
      </section>

      <section className="pb-10">
        <div className={`${bar} mx-5 mb-4 h-6 w-44 md:mx-12`} />
        <div className="flex gap-4 overflow-hidden px-5 md:px-12">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="w-[150px] shrink-0 md:w-[190px]">
              <div className={`${bar} aspect-[2/3] w-full rounded-xl`} />
              <div className={`${bar} mt-2 h-4 w-3/4`} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

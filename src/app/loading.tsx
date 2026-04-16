export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-start justify-center px-6 py-20 md:px-10">
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone">
        Loading
      </span>
      <div className="mt-6 h-16 w-80 animate-pulse bg-stone-light/40" />
      <div className="mt-4 h-6 w-96 animate-pulse bg-stone-light/30" />
      <div className="mt-2 h-6 w-72 animate-pulse bg-stone-light/30" />
    </div>
  );
}

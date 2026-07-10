import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-950 p-6 text-center">
      <div>
        <h1 className="text-5xl font-bold text-white">🌊 Aqua</h1>
        <p className="mt-3 max-w-md text-slate-400">
          Real-time money streaming on Stellar. Stream tokens per second for
          salaries, subscriptions &amp; vesting.
        </p>
      </div>
      <Dashboard />
    </main>
  );
}

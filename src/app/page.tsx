import { profile } from "@/data/profile";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative">
        <p className="font-mono text-sm text-zinc-500">{profile.shortName}</p>
        <p className="mt-2 font-mono text-xs text-zinc-700">
          <a href={`mailto:${profile.email}`} className="hover:text-zinc-400">{profile.email}</a>
        </p>
      </div>
    </main>
  );
}

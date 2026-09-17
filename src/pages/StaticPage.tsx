import type { ReactNode } from 'react';

export function StaticPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="mx-auto max-w-[820px] px-3 py-10 sm:px-6">
    <h1 className="text-2xl font-black text-[#122b3b]">{title}</h1>
    <div className="mt-5 grid gap-4 text-sm leading-7 text-slate-600">{children}</div>
  </main>;
}

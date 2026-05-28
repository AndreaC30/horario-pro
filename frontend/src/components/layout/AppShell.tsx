import type { ReactNode } from "react";

import { BottomNav } from "./BottomNav";

type AppShellProps = {
  title: string;
  children: ReactNode;
};

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-app flex-col bg-surface pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur supports-[padding:max(0px)]:pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}

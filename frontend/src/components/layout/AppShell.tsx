import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { BottomNav } from "./BottomNav";
import { OfflineBanner } from "./OfflineBanner";

type AppShellProps = {
  title: string;
  children: ReactNode;
};

export function AppShell({ title, children }: AppShellProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md supports-[padding:max(0px)]:pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold tracking-tight text-text-primary">{title}</h1>
          <Button variant="ghost" type="button" onClick={handleLogout} className="min-h-touch px-2 text-sm">
            Salir
          </Button>
        </div>
      </header>
      <OfflineBanner />
      <main className="flex-1 px-4 py-4 sm:px-5">{children}</main>
      <BottomNav />
    </div>
  );
}

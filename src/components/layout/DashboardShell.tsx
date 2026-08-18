import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, CalendarRange, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/store/app-store";
import { navByRole } from "./nav";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

function NavList({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = navByRole[role];
  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active =
          item.to === `/${role}` ? pathname === item.to : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  role,
  title,
  description,
  actions,
  children,
}: {
  role: Role;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, setUser, notifications, settings, ready } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && (!user || user.role !== role)) {
      navigate({ to: "/login", replace: true });
    }
  }, [ready, user, role, navigate]);

  const unread = notifications.filter(
    (n) => (n.role === role || n.role === "all") && !n.read,
  ).length;

  if (!ready || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading workspace…</div>
      </div>
    );
  }

  const handleLogout = () => {
    setUser(null);
    navigate({ to: "/login" });
  };

  const brand = (
    <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
      <div className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <CalendarRange className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-sidebar-foreground">ClassSync</p>
        <p className="truncate text-xs text-sidebar-foreground/60">{settings.collegeName}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar lg:flex">
        {brand}
        <div className="flex-1 overflow-y-auto">
          <NavList role={role} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {brand}
              <div className="max-h-[calc(100vh-9rem)] overflow-y-auto">
                <NavList role={role} onNavigate={() => setOpen(false)} />
              </div>
              <div className="border-t border-sidebar-border p-3">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/75"
                >
                  <LogOut className="size-4" /> Logout
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-foreground">{title}</h1>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <Link to={`/${role}/notifications`} aria-label="Notifications">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="size-4" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </Button>
            </Link>
            <div className="hidden items-center gap-2 rounded-md border border-border px-3 py-1.5 sm:flex">
              <div className="text-right">
                <p className="text-xs font-semibold leading-tight">{user.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export function StatusBadge({ tone, children }: { tone: "ok" | "warn" | "bad" | "info"; children: ReactNode }) {
  const map = {
    ok: "bg-success/15 text-success border-success/30",
    warn: "bg-warning/20 text-warning-foreground border-warning/40",
    bad: "bg-destructive/12 text-destructive border-destructive/30",
    info: "bg-info/12 text-info border-info/30",
  } as const;
  return (
    <Badge variant="outline" className={cn("font-medium", map[tone])}>
      {children}
    </Badge>
  );
}

export { X };

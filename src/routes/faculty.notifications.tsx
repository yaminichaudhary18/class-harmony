import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/app-store";

export const Route = createFileRoute("/faculty/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Faculty — ClassSync" },
      { name: "description", content: "Notifications and timetable alerts." },
    ],
  }),
  component: FacultyNotificationsPage,
});

function FacultyNotificationsPage() {
  const { notifications, markNotificationRead } = useStore();
  const list = notifications.filter((n) => n.role === "faculty" || n.role === "all");

  return (
    <DashboardShell
      role="faculty"
      title="Notifications & Alerts"
      description="Timetable updates, administrative alerts, and reschedule status."
    >
      <Card>
        <CardContent className="p-4">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Bell className="size-8 opacity-40" />
              <p className="mt-2 text-sm">No notifications available.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between gap-3 rounded-md border p-3.5 transition-colors ${
                    n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && (
                        <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-2 text-[10px] text-muted-foreground/70">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                    {n.link && (
                      <Link
                        to={n.link}
                        className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                      >
                        View related page →
                      </Link>
                    )}
                  </div>
                  {!n.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <Check className="size-4" /> Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}


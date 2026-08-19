import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Check, Send, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store/app-store";
import type { Role } from "@/types";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications Console — ClassSync" },
      { name: "description", content: "Campus notifications, broadcast alerts, and system logs." },
    ],
  }),
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const store = useStore();
  const { notifications, markNotificationRead, notify } = store;
  const [broadcastRole, setBroadcastRole] = useState<Role | "all">("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both a title and message.");
      return;
    }
    notify({
      role: broadcastRole,
      title: title.trim(),
      message: message.trim(),
    });
    store.logActivity(`Broadcast sent to ${broadcastRole}: "${title.trim()}"`);
    toast.success(`Notification broadcasted to ${broadcastRole}.`);
    setTitle("");
    setMessage("");
  };

  const clearAll = () => {
    store.update({ notifications: [] });
    toast.success("Notifications cleared.");
  };

  return (
    <DashboardShell
      role="admin"
      title="System Notifications & Broadcasts"
      description="Manage institutional alerts, publication announcements, and track user notifications."
      actions={
        notifications.length > 0 ? (
          <Button variant="outline" size="sm" onClick={clearAll}>
            <Trash2 className="size-4" /> Clear All
          </Button>
        ) : null
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="size-4 text-primary" />
              <CardTitle className="text-base">Broadcast Announcement</CardTitle>
            </div>
            <CardDescription>Send an instant message to faculty, students, or all users.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="target">Target Audience</Label>
                <Select
                  value={broadcastRole}
                  onValueChange={(v) => setBroadcastRole(v as Role | "all")}
                >
                  <SelectTrigger id="target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles (Campus-wide)</SelectItem>
                    <SelectItem value="faculty">Faculty Only</SelectItem>
                    <SelectItem value="student">Students Only</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ntitle">Notification Title</Label>
                <Input
                  id="ntitle"
                  placeholder="e.g. Schedule Revision Announced"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nmsg">Message</Label>
                <Input
                  id="nmsg"
                  placeholder="e.g. Please check your updated weekly timetable."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={140}
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="size-4" /> Send Broadcast
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Notification History ({notifications.length})</CardTitle>
            <CardDescription>Log of all system notifications generated and sent.</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Bell className="size-8 opacity-40" />
                <p className="mt-2 text-sm">No notification records.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start justify-between gap-3 rounded-md border p-3.5 transition-colors ${
                      n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{n.title}</p>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {n.role}
                        </span>
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
                          View related section →
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
      </div>
    </DashboardShell>
  );
}


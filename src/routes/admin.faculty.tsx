import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/store/app-store";
import { demoDays } from "@/data/demoData";
import type { Faculty } from "@/types";

export const Route = createFileRoute("/admin/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty Management — ClassSync" },
      { name: "description", content: "Add, edit and manage faculty members, workload limits and subjects." },
      { property: "og:title", content: "Faculty Management — ClassSync" },
      { property: "og:description", content: "Manage teaching staff and their weekly load." },
    ],
  }),
  component: FacultyPage,
});

const blank = (): Faculty => ({
  id: `f-${Date.now()}`,
  name: "",
  facultyId: "",
  department: "CSE",
  email: "",
  maxClassesPerDay: 4,
  availability: Object.fromEntries(demoDays.map((d) => [d, Array(8).fill(true)])),
});

function FacultyPage() {
  const store = useStore();
  const { faculty, subjects, timetable } = store;
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Faculty | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = useMemo(
    () =>
      faculty.filter((f) =>
        [f.name, f.facultyId, f.department, f.email].join(" ").toLowerCase().includes(query.toLowerCase()),
      ),
    [faculty, query],
  );

  const weeklyLoad = (id: string) =>
    (timetable?.classes ?? []).filter((c) => c.facultyId === id).length;

  const save = () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.facultyId.trim() || !draft.email.trim()) {
      toast.error("Name, faculty ID and email are required.");
      return;
    }
    const next = isNew
      ? [...faculty, draft]
      : faculty.map((f) => (f.id === draft.id ? draft : f));
    store.update({ faculty: next });
    store.logActivity(`${isNew ? "Added" : "Updated"} faculty ${draft.name}`);
    toast.success(`Faculty ${isNew ? "added" : "updated"}.`);
    setDraft(null);
  };

  const remove = (f: Faculty) => {
    store.update({ faculty: faculty.filter((x) => x.id !== f.id) });
    store.logActivity(`Removed faculty ${f.name}`);
    toast.success("Faculty removed.");
  };

  return (
    <DashboardShell
      role="admin"
      title="Faculty Management"
      description={`${faculty.length} teaching staff members`}
      actions={
        <Button
          onClick={() => {
            setDraft(blank());
            setIsNew(true);
          }}
        >
          <Plus className="size-4" /> Add Faculty
        </Button>
      }
    >
      <Input
        placeholder="Search faculty by name, ID or department…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 max-w-sm"
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Faculty ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Max / day</TableHead>
                <TableHead>Weekly load</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => {
                const subs = subjects.filter((s) => s.facultyId === f.id);
                return (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.email}</div>
                    </TableCell>
                    <TableCell>{f.facultyId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{f.department}</Badge>
                    </TableCell>
                    <TableCell className="max-w-56">
                      <span className="text-xs text-muted-foreground">
                        {subs.map((s) => s.code).join(", ") || "—"}
                      </span>
                    </TableCell>
                    <TableCell>{f.maxClassesPerDay}</TableCell>
                    <TableCell>{weeklyLoad(f.id)} classes</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${f.name}`}
                        onClick={() => {
                          setDraft({ ...f });
                          setIsNew(false);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${f.name}`}
                        onClick={() => remove(f)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Add faculty" : "Edit faculty"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fname">Full name</Label>
                <Input
                  id="fname"
                  maxLength={80}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fid">Faculty ID</Label>
                <Input
                  id="fid"
                  maxLength={20}
                  value={draft.facultyId}
                  onChange={(e) => setDraft({ ...draft, facultyId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fdept">Department</Label>
                <Input
                  id="fdept"
                  maxLength={30}
                  value={draft.department}
                  onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="femail">Email</Label>
                <Input
                  id="femail"
                  type="email"
                  maxLength={120}
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fmax">Max classes per day</Label>
                <Input
                  id="fmax"
                  type="number"
                  min={1}
                  max={8}
                  value={draft.maxClassesPerDay}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      maxClassesPerDay: Math.min(8, Math.max(1, Number(e.target.value) || 1)),
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

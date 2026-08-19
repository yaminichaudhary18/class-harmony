import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Section } from "@/types";

export const Route = createFileRoute("/admin/sections")({
  head: () => ({
    meta: [
      { title: "Sections & Batches — ClassSync" },
      { name: "description", content: "Manage class sections, student strength and assigned subjects." },
      { property: "og:title", content: "Sections & Batches — ClassSync" },
      { property: "og:description", content: "Course, semester and strength management." },
    ],
  }),
  component: SectionsPage,
});

const blank = (): Section => ({
  id: `sec-${Date.now()}`,
  name: "",
  course: "B.Tech Computer Science",
  semester: 4,
  studentCount: 60,
  subjectIds: [],
});

function SectionsPage() {
  const store = useStore();
  const { sections, subjects } = store;
  const [draft, setDraft] = useState<Section | null>(null);
  const [isNew, setIsNew] = useState(false);

  const save = () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      toast.error("Section name is required.");
      return;
    }
    store.update({
      sections: isNew ? [...sections, draft] : sections.map((s) => (s.id === draft.id ? draft : s)),
    });
    store.logActivity(`${isNew ? "Added" : "Updated"} section ${draft.name}`);
    toast.success(`Section ${isNew ? "added" : "updated"}.`);
    setDraft(null);
  };

  return (
    <DashboardShell
      role="admin"
      title="Sections & Batches"
      description={`${sections.length} sections · ${sections.reduce((a, s) => a + s.studentCount, 0)} students`}
      actions={
        <Button
          onClick={() => {
            setDraft(blank());
            setIsNew(true);
          }}
        >
          <Plus className="size-4" /> Add Section
        </Button>
      }
    >
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.course}</TableCell>
                  <TableCell>{s.semester}</TableCell>
                  <TableCell>{s.studentCount}</TableCell>
                  <TableCell className="max-w-72">
                    <div className="flex flex-wrap gap-1">
                      {s.subjectIds.map((id) => (
                        <Badge key={id} variant="secondary" className="text-[10px]">
                          {subjects.find((x) => x.id === id)?.code ?? id}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${s.name}`}
                      onClick={() => {
                        setDraft({ ...s, subjectIds: [...s.subjectIds] });
                        setIsNew(false);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${s.name}`}
                      onClick={() => {
                        store.update({ sections: sections.filter((x) => x.id !== s.id) });
                        toast.success("Section removed.");
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Add section" : "Edit section"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="sname">Section name</Label>
                <Input
                  id="sname"
                  maxLength={20}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="scourse">Course</Label>
                <Input
                  id="scourse"
                  maxLength={60}
                  value={draft.course}
                  onChange={(e) => setDraft({ ...draft, course: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ssem">Semester</Label>
                <Input
                  id="ssem"
                  type="number"
                  min={1}
                  max={8}
                  value={draft.semester}
                  onChange={(e) =>
                    setDraft({ ...draft, semester: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="scount">Student count</Label>
                <Input
                  id="scount"
                  type="number"
                  min={1}
                  max={300}
                  value={draft.studentCount}
                  onChange={(e) =>
                    setDraft({ ...draft, studentCount: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Subjects assigned</Label>
                <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto rounded-md border border-border p-3 sm:grid-cols-2">
                  {subjects.map((sub) => {
                    const checked = draft.subjectIds.includes(sub.id);
                    return (
                      <label key={sub.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setDraft({
                              ...draft,
                              subjectIds: v
                                ? [...draft.subjectIds, sub.id]
                                : draft.subjectIds.filter((i) => i !== sub.id),
                            })
                          }
                        />
                        <span className="truncate">
                          {sub.code} · {sub.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
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

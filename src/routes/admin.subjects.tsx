import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Subject } from "@/types";

export const Route = createFileRoute("/admin/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — ClassSync" },
      { name: "description", content: "Manage theory and lab subjects, credits and weekly class counts." },
      { property: "og:title", content: "Subjects — ClassSync" },
      { property: "og:description", content: "Subject catalogue with faculty mapping." },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const store = useStore();
  const { subjects, faculty } = store;
  const [draft, setDraft] = useState<Subject | null>(null);
  const [isNew, setIsNew] = useState(false);

  const blank = (): Subject => ({
    id: `sub-${Date.now()}`,
    name: "",
    code: "",
    credits: 3,
    type: "theory",
    classesPerWeek: 3,
    facultyId: faculty[0]?.id ?? "",
    duration: 1,
  });

  const save = () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.code.trim()) {
      toast.error("Subject name and code are required.");
      return;
    }
    store.update({
      sections: store.sections,
      subjects: isNew ? [...subjects, draft] : subjects.map((s) => (s.id === draft.id ? draft : s)),
    });
    store.logActivity(`${isNew ? "Added" : "Updated"} subject ${draft.code}`);
    toast.success(`Subject ${isNew ? "added" : "updated"}.`);
    setDraft(null);
  };

  return (
    <DashboardShell
      role="admin"
      title="Subjects"
      description={`${subjects.filter((s) => s.type === "theory").length} theory · ${subjects.filter((s) => s.type === "lab").length} lab subjects`}
      actions={
        <Button
          onClick={() => {
            setDraft(blank());
            setIsNew(true);
          }}
        >
          <Plus className="size-4" /> Add Subject
        </Button>
      }
    >
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Classes / week</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.code}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant={s.type === "lab" ? "default" : "secondary"}>{s.type}</Badge>
                  </TableCell>
                  <TableCell>{s.credits}</TableCell>
                  <TableCell>
                    {s.classesPerWeek} × {s.duration}p
                  </TableCell>
                  <TableCell>{faculty.find((f) => f.id === s.facultyId)?.name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${s.name}`}
                      onClick={() => {
                        setDraft({ ...s });
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
                        store.update({ subjects: subjects.filter((x) => x.id !== s.id) });
                        toast.success("Subject removed.");
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "Add subject" : "Edit subject"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="subcode">Code</Label>
                <Input
                  id="subcode"
                  maxLength={12}
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="subname">Name</Label>
                <Input
                  id="subname"
                  maxLength={60}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={draft.type}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      type: v as Subject["type"],
                      duration: v === "lab" ? 2 : 1,
                      classesPerWeek: v === "lab" ? 1 : draft.classesPerWeek,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="lab">Laboratory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcredits">Credits</Label>
                <Input
                  id="subcredits"
                  type="number"
                  min={1}
                  max={6}
                  value={draft.credits}
                  onChange={(e) =>
                    setDraft({ ...draft, credits: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="subcpw">Classes per week</Label>
                <Input
                  id="subcpw"
                  type="number"
                  min={1}
                  max={6}
                  value={draft.classesPerWeek}
                  onChange={(e) =>
                    setDraft({ ...draft, classesPerWeek: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>
              <div>
                <Label>Assigned faculty</Label>
                <Select
                  value={draft.facultyId}
                  onValueChange={(v) => setDraft({ ...draft, facultyId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculty.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

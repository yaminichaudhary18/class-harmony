import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/store/app-store";
import { roomUtilisationStats } from "@/scheduler";
import type { Room } from "@/types";

export function RoomsManager({ mode }: { mode: "classroom" | "lab" }) {
  const store = useStore();
  const { rooms, timetable, schedulerInput } = store;
  const [draft, setDraft] = useState<Room | null>(null);
  const [isNew, setIsNew] = useState(false);

  const list = rooms.filter((r) => (mode === "lab" ? r.type === "lab" : r.type !== "lab"));
  const stats = roomUtilisationStats(timetable?.classes ?? [], schedulerInput);
  const usage = (id: string) => stats.find((s) => s.room.id === id)?.utilisation ?? 0;

  const blank = (): Room => ({
    id: `${mode === "lab" ? "l" : "r"}-${Date.now()}`,
    number: "",
    building: "Block A",
    floor: 1,
    capacity: mode === "lab" ? 60 : 50,
    type: mode === "lab" ? "lab" : "classroom",
    projector: true,
    smartBoard: false,
    computers: mode === "lab" ? 40 : 0,
    equipment: mode === "lab" ? "" : undefined,
    software: mode === "lab" ? "" : undefined,
    status: "available",
  });

  const save = () => {
    if (!draft) return;
    if (!draft.number.trim()) {
      toast.error(mode === "lab" ? "Lab name is required." : "Room number is required.");
      return;
    }
    store.update({
      rooms: isNew ? [...rooms, draft] : rooms.map((r) => (r.id === draft.id ? draft : r)),
    });
    store.logActivity(`${isNew ? "Added" : "Updated"} ${mode} ${draft.number}`);
    toast.success(`${mode === "lab" ? "Lab" : "Classroom"} ${isNew ? "added" : "updated"}.`);
    setDraft(null);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setDraft(blank());
            setIsNew(true);
          }}
        >
          <Plus className="size-4" /> Add {mode === "lab" ? "Lab" : "Classroom"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{mode === "lab" ? "Lab" : "Room"}</TableHead>
                <TableHead>Building / Floor</TableHead>
                <TableHead>Capacity</TableHead>
                {mode === "lab" ? <TableHead>Computers</TableHead> : <TableHead>Type</TableHead>}
                <TableHead>{mode === "lab" ? "Equipment" : "Facilities"}</TableHead>
                <TableHead>Utilisation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.number}</TableCell>
                  <TableCell>
                    {r.building} · Floor {r.floor}
                  </TableCell>
                  <TableCell>{r.capacity}</TableCell>
                  {mode === "lab" ? (
                    <TableCell>{r.computers}</TableCell>
                  ) : (
                    <TableCell>
                      <Badge variant="secondary">{r.type}</Badge>
                    </TableCell>
                  )}
                  <TableCell className="max-w-56 text-xs text-muted-foreground">
                    {mode === "lab"
                      ? [r.equipment, r.software].filter(Boolean).join(" · ") || "—"
                      : [r.projector && "Projector", r.smartBoard && "Smart board"]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                  </TableCell>
                  <TableCell>{usage(r.id)}%</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "available" ? "secondary" : "destructive"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${r.number}`}
                      onClick={() => {
                        setDraft({ ...r });
                        setIsNew(false);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${r.number}`}
                      onClick={() => {
                        store.update({ rooms: rooms.filter((x) => x.id !== r.id) });
                        toast.success("Removed.");
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
            <DialogTitle>
              {isNew ? "Add" : "Edit"} {mode === "lab" ? "laboratory" : "classroom"}
            </DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="rnum">{mode === "lab" ? "Lab name" : "Room number"}</Label>
                <Input
                  id="rnum"
                  maxLength={40}
                  value={draft.number}
                  onChange={(e) => setDraft({ ...draft, number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="rbuild">Building</Label>
                <Input
                  id="rbuild"
                  maxLength={30}
                  value={draft.building}
                  onChange={(e) => setDraft({ ...draft, building: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="rfloor">Floor</Label>
                <Input
                  id="rfloor"
                  type="number"
                  min={0}
                  max={12}
                  value={draft.floor}
                  onChange={(e) => setDraft({ ...draft, floor: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="rcap">Capacity</Label>
                <Input
                  id="rcap"
                  type="number"
                  min={1}
                  max={400}
                  value={draft.capacity}
                  onChange={(e) =>
                    setDraft({ ...draft, capacity: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>
              {mode === "classroom" && (
                <div>
                  <Label>Room type</Label>
                  <Select
                    value={draft.type}
                    onValueChange={(v) => setDraft({ ...draft, type: v as Room["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="seminar">Seminar hall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {mode === "lab" && (
                <>
                  <div>
                    <Label htmlFor="rcomp">Computers</Label>
                    <Input
                      id="rcomp"
                      type="number"
                      min={0}
                      max={300}
                      value={draft.computers}
                      onChange={(e) =>
                        setDraft({ ...draft, computers: Math.max(0, Number(e.target.value) || 0) })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="requip">Equipment</Label>
                    <Input
                      id="requip"
                      maxLength={120}
                      value={draft.equipment ?? ""}
                      onChange={(e) => setDraft({ ...draft, equipment: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="rsoft">Software available</Label>
                    <Input
                      id="rsoft"
                      maxLength={120}
                      value={draft.software ?? ""}
                      onChange={(e) => setDraft({ ...draft, software: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label htmlFor="rproj">Projector</Label>
                <Switch
                  id="rproj"
                  checked={draft.projector}
                  onCheckedChange={(v) => setDraft({ ...draft, projector: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <Label htmlFor="rsmart">Smart board</Label>
                <Switch
                  id="rsmart"
                  checked={draft.smartBoard}
                  onCheckedChange={(v) => setDraft({ ...draft, smartBoard: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 sm:col-span-2">
                <Label htmlFor="rstatus">Available for scheduling</Label>
                <Switch
                  id="rstatus"
                  checked={draft.status === "available"}
                  onCheckedChange={(v) =>
                    setDraft({ ...draft, status: v ? "available" : "maintenance" })
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
    </>
  );
}

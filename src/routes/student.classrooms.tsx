import { createFileRoute } from "@tanstack/react-router";
import { Building2, Cpu, MapPin } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/app-store";

export const Route = createFileRoute("/student/classrooms")({
  head: () => ({
    meta: [
      { title: "Classroom Directory — Student — ClassSync" },
      { name: "description", content: "Campus classrooms, lab locations, and amenities." },
    ],
  }),
  component: StudentClassroomsPage,
});

function StudentClassroomsPage() {
  const { rooms } = useStore();

  return (
    <DashboardShell
      role="student"
      title="Classrooms & Laboratories Directory"
      description="Find lecture hall locations, floors, and laboratory facilities across the campus."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => {
          const isLab = r.type === "lab";
          return (
            <Card key={r.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isLab ? (
                      <Cpu className="size-5 text-accent" />
                    ) : (
                      <Building2 className="size-5 text-primary" />
                    )}
                    <CardTitle className="text-base">{r.number}</CardTitle>
                  </div>
                  <Badge variant={isLab ? "default" : "secondary"}>
                    {r.type}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {r.building} · Floor {r.floor}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between border-t border-border/50 pt-2">
                  <span>Capacity:</span>
                  <span className="font-semibold text-foreground">{r.capacity} seats</span>
                </div>
                {isLab && r.computers > 0 && (
                  <div className="flex justify-between">
                    <span>Workstations:</span>
                    <span className="font-semibold text-foreground">{r.computers} PCs</span>
                  </div>
                )}
                {isLab && r.software && (
                  <div className="flex justify-between">
                    <span>Software:</span>
                    <span className="font-semibold text-foreground truncate max-w-44">{r.software}</span>
                  </div>
                )}
                {!isLab && (
                  <div className="flex justify-between">
                    <span>Amenities:</span>
                    <span className="font-semibold text-foreground">
                      {[r.projector && "Projector", r.smartBoard && "Smart Board"].filter(Boolean).join(", ") || "Standard"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}


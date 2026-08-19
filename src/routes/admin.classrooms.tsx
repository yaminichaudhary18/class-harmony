import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoomsManager } from "@/components/admin/RoomsManager";

export const Route = createFileRoute("/admin/classrooms")({
  head: () => ({
    meta: [
      { title: "Classrooms Management — ClassSync" },
      { name: "description", content: "Manage lecture halls, classroom capacities, and facilities." },
      { property: "og:title", content: "Classrooms Management — ClassSync" },
    ],
  }),
  component: ClassroomsPage,
});

function ClassroomsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Classrooms Management"
      description="Manage classroom inventory, capacities, floor locations, and AV facilities."
    >
      <RoomsManager mode="classroom" />
    </DashboardShell>
  );
}


import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoomsManager } from "@/components/admin/RoomsManager";

export const Route = createFileRoute("/admin/labs")({
  head: () => ({
    meta: [
      { title: "Labs Management — ClassSync" },
      { name: "description", content: "Manage computer, network, and electronics labs and equipment." },
      { property: "og:title", content: "Labs Management — ClassSync" },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Laboratory Management"
      description="Configure lab capacities, equipment, installed software, and status."
    >
      <RoomsManager mode="lab" />
    </DashboardShell>
  );
}


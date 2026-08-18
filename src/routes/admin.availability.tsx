import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/availability")({
  component: Page,
});

function Page() {
  return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
}

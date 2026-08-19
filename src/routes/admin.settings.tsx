import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Save, Settings as SettingsIcon } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useStore } from "@/store/app-store";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "System Settings — ClassSync" },
      { name: "description", content: "Configure institutional parameters and reset system demo data." },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const store = useStore();
  const { settings, resetDemoData } = store;

  const [collegeName, setCollegeName] = useState(settings.collegeName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [maxClasses, setMaxClasses] = useState(settings.maxClassesPerDayDefault);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.update({
      settings: {
        ...settings,
        collegeName: collegeName.trim() || settings.collegeName,
        academicYear: academicYear.trim() || settings.academicYear,
        maxClassesPerDayDefault: Math.max(1, Math.min(8, maxClasses)),
      },
    });
    store.logActivity("Institutional settings updated");
    toast.success("Institutional settings saved.");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all academic data to the Smart India Hackathon demo baseline?")) {
      resetDemoData();
      toast.success("Demo dataset restored to initial state.");
    }
  };

  return (
    <DashboardShell
      role="admin"
      title="System & Academic Settings"
      description="Manage institutional metadata, default workload parameters, and demo state."
    >
      <div className="max-w-2xl space-y-6">
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SettingsIcon className="size-5 text-primary" />
                <CardTitle className="text-base">Institutional Configuration</CardTitle>
              </div>
              <CardDescription>
                Header branding, academic term, and global constraints applied across dashboards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="collegeName">College / University Name</Label>
                <Input
                  id="collegeName"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="acadYear">Academic Year</Label>
                <Input
                  id="acadYear"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  maxLength={30}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxClasses">Default Max Lectures / Day (Per Faculty)</Label>
                <Input
                  id="maxClasses"
                  type="number"
                  min={1}
                  max={8}
                  value={maxClasses}
                  onChange={(e) => setMaxClasses(Number(e.target.value) || 4)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">
                <Save className="size-4" /> Save Settings
              </Button>
            </CardFooter>
          </Card>
        </form>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Demo Baseline Reset</CardTitle>
            <CardDescription>
              Reset all faculty, sections, subjects, classrooms, and generated timetables back to the original demo dataset.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="destructive" onClick={handleReset}>
              <RotateCcw className="size-4" /> Restore Default Demo Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}


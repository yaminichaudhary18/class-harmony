import type { DayName, ScheduledClass } from "@/types";
import { useStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export interface GridColumn {
  id: string;
  label: string;
}

/**
 * Generic timetable grid: rows are periods, columns are days or sections.
 * `getClasses` resolves which classes belong to a (column, period) cell.
 */
export function TimetableGrid({
  columns,
  getClasses,
  onCellClick,
  compact,
}: {
  columns: GridColumn[];
  getClasses: (columnId: string, period: number) => ScheduledClass[];
  onCellClick?: (cls: ScheduledClass) => void;
  compact?: boolean;
}) {
  const { settings, subjects, faculty, rooms, sections } = useStore();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/60">
            <th className="w-32 border-b border-r border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Time
            </th>
            {columns.map((c) => (
              <th
                key={c.id}
                className="border-b border-r border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {settings.periods.map((period) => (
            <tr key={period.index} className={period.isBreak ? "bg-muted/40" : undefined}>
              <td className="border-b border-r border-border px-3 py-2 align-top text-xs font-medium text-muted-foreground">
                {period.label}
              </td>
              {period.isBreak ? (
                <td
                  colSpan={columns.length}
                  className="border-b border-border px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Break
                </td>
              ) : (
                columns.map((col) => {
                  const cellClasses = getClasses(col.id, period.index);
                  return (
                    <td
                      key={col.id}
                      className="border-b border-r border-border p-1.5 align-top last:border-r-0"
                    >
                      {cellClasses.length === 0 ? (
                        <span className="block px-1 py-2 text-xs text-muted-foreground/50">—</span>
                      ) : (
                        cellClasses.map((cls) => {
                          const subject = subjects.find((s) => s.id === cls.subjectId);
                          const fac = faculty.find((f) => f.id === cls.facultyId);
                          const room = rooms.find((r) => r.id === cls.roomId);
                          const section = sections.find((s) => s.id === cls.sectionId);
                          const isLab = subject?.type === "lab";
                          return (
                            <button
                              key={cls.id}
                              type="button"
                              onClick={onCellClick ? () => onCellClick(cls) : undefined}
                              className={cn(
                                "mb-1 block w-full rounded-md border px-2 py-1.5 text-left transition-colors last:mb-0",
                                isLab
                                  ? "border-accent/40 bg-accent/15 hover:bg-accent/25"
                                  : "border-primary/25 bg-primary/8 hover:bg-primary/15",
                                onCellClick ? "cursor-pointer" : "cursor-default",
                              )}
                            >
                              <span className="block truncate text-xs font-semibold text-foreground">
                                {subject?.name ?? "—"}
                                {cls.duration === 2 ? " (2 hr)" : ""}
                              </span>
                              {!compact && (
                                <>
                                  <span className="block truncate text-[11px] text-muted-foreground">
                                    {fac?.name}
                                  </span>
                                  <span className="block truncate text-[11px] text-muted-foreground">
                                    {section?.name} · Room {room?.number}
                                  </span>
                                </>
                              )}
                            </button>
                          );
                        })
                      )}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function classCoversPeriod(cls: ScheduledClass, period: number) {
  return cls.duration === 2
    ? period === cls.period || period === cls.period + 1
    : period === cls.period;
}

export function dayColumns(days: DayName[]): GridColumn[] {
  return days.map((d) => ({ id: d, label: d }));
}

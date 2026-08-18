import type { DayName, ScheduledClass, Settings } from "@/types";

export function todayName(): DayName {
  const map: DayName[] = ["Mon", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date().getDay(); // 0 = Sunday
  return map[d] ?? "Mon";
}

export function periodLabel(settings: Settings, period: number) {
  return settings.periods.find((p) => p.index === period)?.label ?? `Period ${period + 1}`;
}

export function coversPeriod(cls: ScheduledClass, period: number) {
  return cls.duration === 2
    ? period === cls.period || period === cls.period + 1
    : period === cls.period;
}

export function sortByPeriod(a: ScheduledClass, b: ScheduledClass) {
  return a.period - b.period;
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: (string | number)[][]) {
  return rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

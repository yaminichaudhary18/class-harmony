import type {
  Conflict,
  DayName,
  Faculty,
  Room,
  ScheduleScore,
  ScheduledClass,
  Section,
  Settings,
  Subject,
  Timetable,
} from "@/types";

export interface SchedulerInput {
  faculty: Faculty[];
  sections: Section[];
  subjects: Subject[];
  rooms: Room[];
  settings: Settings;
}

export interface Slot {
  day: DayName;
  period: number;
}

/** All teaching slots (break periods excluded). */
export function buildSlots(settings: Settings): Slot[] {
  const slots: Slot[] = [];
  for (const day of settings.workingDays) {
    for (const p of settings.periods) {
      if (!p.isBreak) slots.push({ day, period: p.index });
    }
  }
  return slots;
}

export function teachingPeriods(settings: Settings): number[] {
  return settings.periods.filter((p) => !p.isBreak).map((p) => p.index);
}

/** periods occupied by a session starting at `period` with `duration` */
export function sessionPeriods(
  settings: Settings,
  period: number,
  duration: 1 | 2,
): number[] | null {
  const teaching = teachingPeriods(settings);
  const idx = teaching.indexOf(period);
  if (idx === -1) return null;
  const out: number[] = [period];
  for (let i = 1; i < duration; i++) {
    const next = teaching[idx + i];
    // consecutive periods only (no break in between)
    if (next === undefined || next !== period + i) return null;
    out.push(next);
  }
  return out;
}

interface Occupancy {
  faculty: Set<string>;
  room: Set<string>;
  section: Set<string>;
}

const key = (day: string, period: number, id: string) => `${day}|${period}|${id}`;

/**
 * Smart classroom allocation: pick the SMALLEST suitable free room,
 * so large halls are not wasted on small sections.
 */
export function allocateClassroom(
  rooms: Room[],
  subject: Subject,
  section: Section,
  day: DayName,
  periods: number[],
  occupied: Occupancy,
): Room | null {
  const candidates = rooms
    .filter((r) => r.status === "available")
    .filter((r) => (subject.type === "lab" ? r.type === "lab" : r.type !== "lab"))
    .filter((r) => r.capacity >= section.studentCount)
    .filter((r) => (subject.type === "lab" ? r.computers >= 0 : true))
    .filter((r) => periods.every((p) => !occupied.room.has(key(day, p, r.id))))
    .sort((a, b) => a.capacity - b.capacity);
  return candidates[0] ?? null;
}

interface Requirement {
  sectionId: string;
  subjectId: string;
  duration: 1 | 2;
  isLab: boolean;
}

function buildRequirements(input: SchedulerInput): Requirement[] {
  const reqs: Requirement[] = [];
  for (const section of input.sections) {
    for (const subjectId of section.subjectIds) {
      const subject = input.subjects.find((s) => s.id === subjectId);
      if (!subject) continue;
      for (let i = 0; i < subject.classesPerWeek; i++) {
        reqs.push({
          sectionId: section.id,
          subjectId: subject.id,
          duration: subject.duration,
          isLab: subject.type === "lab",
        });
      }
    }
  }
  // most constrained first: labs (2 consecutive periods) then heavier subjects
  return reqs.sort((a, b) => Number(b.isLab) - Number(a.isLab) || b.duration - a.duration);
}

/** Deterministic pseudo-random for repeatable restarts. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Attempt {
  classes: ScheduledClass[];
  unplaced: { sectionId: string; subjectId: string; count: number }[];
}

function runAttempt(input: SchedulerInput, seed: number): Attempt {
  const rand = mulberry32(seed);
  const slots = buildSlots(input.settings);
  const occupied: Occupancy = { faculty: new Set(), room: new Set(), section: new Set() };
  const classes: ScheduledClass[] = [];
  const unplacedMap = new Map<string, number>();

  const facultyDayLoad = new Map<string, number>();
  const sectionDaySubject = new Map<string, number>(); // sectionId|subjectId|day -> count
  const facultyTotal = new Map<string, number>();

  const reqs = buildRequirements(input);
  // light shuffle inside the priority groups for restart diversity
  const grouped = reqs
    .map((r, i) => ({ r, k: i + rand() * 3 }))
    .sort((a, b) => Number(b.r.isLab) - Number(a.r.isLab) || a.k - b.k)
    .map((x) => x.r);

  const soft = input.settings.softConstraints;

  for (const req of grouped) {
    const subject = input.subjects.find((s) => s.id === req.subjectId)!;
    const section = input.sections.find((s) => s.id === req.sectionId)!;
    const facultyMember = input.faculty.find((f) => f.id === subject.facultyId);
    if (!facultyMember) {
      unplacedMap.set(
        `${req.sectionId}|${req.subjectId}`,
        (unplacedMap.get(`${req.sectionId}|${req.subjectId}`) ?? 0) + 1,
      );
      continue;
    }

    let best: { slot: Slot; periods: number[]; room: Room; cost: number } | null = null;

    for (const slot of slots) {
      const periods = sessionPeriods(input.settings, slot.period, req.duration);
      if (!periods) continue;

      // HARD: faculty availability
      const avail = facultyMember.availability[slot.day] ?? [];
      if (!periods.every((p) => avail[p] !== false)) continue;
      // HARD: faculty free
      if (periods.some((p) => occupied.faculty.has(key(slot.day, p, facultyMember.id)))) continue;
      // HARD: section free
      if (periods.some((p) => occupied.section.has(key(slot.day, p, section.id)))) continue;
      // HARD: faculty max classes per day
      const loadKey = `${facultyMember.id}|${slot.day}`;
      if ((facultyDayLoad.get(loadKey) ?? 0) + periods.length > facultyMember.maxClassesPerDay)
        continue;
      // HARD: room with sufficient capacity + correct type
      const room = allocateClassroom(input.rooms, subject, section, slot.day, periods, occupied);
      if (!room) continue;

      // SOFT constraint cost
      let cost = 0;
      const sameDaySubject =
        sectionDaySubject.get(`${section.id}|${subject.id}|${slot.day}`) ?? 0;
      if (soft.spreadSubjectAcrossDays) cost += sameDaySubject * 40;
      else cost += sameDaySubject * 5;
      if (soft.minimiseRoomWastage) cost += (room.capacity - section.studentCount) * 0.8;
      if (soft.avoidEdgePeriods) {
        const teaching = teachingPeriods(input.settings);
        if (slot.period === teaching[0]) cost += 6;
        if (slot.period === teaching[teaching.length - 1]) cost += 8;
      }
      if (soft.avoidFacultyConsecutive) {
        const before = occupied.faculty.has(key(slot.day, periods[0] - 1, facultyMember.id));
        const after = occupied.faculty.has(
          key(slot.day, periods[periods.length - 1] + 1, facultyMember.id),
        );
        if (before) cost += 5;
        if (after) cost += 5;
      }
      if (soft.avoidStudentConsecutive) {
        const sBefore = occupied.section.has(key(slot.day, periods[0] - 1, section.id));
        const sAfter = occupied.section.has(
          key(slot.day, periods[periods.length - 1] + 1, section.id),
        );
        if (sBefore && sAfter) cost += 10;
      }
      if (soft.balanceFacultyWorkload) {
        cost += (facultyDayLoad.get(loadKey) ?? 0) * 4;
        cost += (facultyTotal.get(facultyMember.id) ?? 0) * 0.3;
      }
      cost += rand() * 2; // tie-breaker

      if (!best || cost < best.cost) best = { slot, periods, room, cost };
    }

    if (!best) {
      const k = `${req.sectionId}|${req.subjectId}`;
      unplacedMap.set(k, (unplacedMap.get(k) ?? 0) + 1);
      continue;
    }

    const cls: ScheduledClass = {
      id: `c-${classes.length + 1}-${req.sectionId}-${req.subjectId}-${best.slot.day}-${best.slot.period}`,
      day: best.slot.day,
      period: best.slot.period,
      duration: req.duration,
      sectionId: section.id,
      subjectId: subject.id,
      facultyId: facultyMember.id,
      roomId: best.room.id,
    };
    classes.push(cls);
    for (const p of best.periods) {
      occupied.faculty.add(key(best.slot.day, p, facultyMember.id));
      occupied.room.add(key(best.slot.day, p, best.room.id));
      occupied.section.add(key(best.slot.day, p, section.id));
    }
    facultyDayLoad.set(
      `${facultyMember.id}|${best.slot.day}`,
      (facultyDayLoad.get(`${facultyMember.id}|${best.slot.day}`) ?? 0) + best.periods.length,
    );
    facultyTotal.set(facultyMember.id, (facultyTotal.get(facultyMember.id) ?? 0) + 1);
    sectionDaySubject.set(
      `${section.id}|${subject.id}|${best.slot.day}`,
      (sectionDaySubject.get(`${section.id}|${subject.id}|${best.slot.day}`) ?? 0) + 1,
    );
  }

  const unplaced = [...unplacedMap.entries()].map(([k, count]) => {
    const [sectionId, subjectId] = k.split("|");
    return { sectionId, subjectId, count };
  });

  return { classes, unplaced };
}

export function expandPeriods(cls: ScheduledClass): number[] {
  return cls.duration === 2 ? [cls.period, cls.period + 1] : [cls.period];
}

/** Full hard-constraint validation of an existing timetable. */
export function detectConflicts(
  classes: ScheduledClass[],
  input: SchedulerInput,
): Conflict[] {
  const conflicts: Conflict[] = [];
  const facultyMap = new Map<string, string[]>();
  const roomMap = new Map<string, string[]>();
  const sectionMap = new Map<string, string[]>();

  const push = (m: Map<string, string[]>, k: string, id: string) => {
    const arr = m.get(k) ?? [];
    arr.push(id);
    m.set(k, arr);
  };

  for (const cls of classes) {
    const subject = input.subjects.find((s) => s.id === cls.subjectId);
    const section = input.sections.find((s) => s.id === cls.sectionId);
    const room = input.rooms.find((r) => r.id === cls.roomId);
    const fac = input.faculty.find((f) => f.id === cls.facultyId);

    for (const p of expandPeriods(cls)) {
      push(facultyMap, key(cls.day, p, cls.facultyId), cls.id);
      push(roomMap, key(cls.day, p, cls.roomId), cls.id);
      push(sectionMap, key(cls.day, p, cls.sectionId), cls.id);

      if (fac && fac.availability[cls.day]?.[p] === false) {
        conflicts.push({
          id: `av-${cls.id}-${p}`,
          type: "availability",
          description: `${fac.name} is marked unavailable at this slot but is scheduled for ${subject?.name ?? "a class"}.`,
          day: cls.day,
          period: p,
          facultyId: cls.facultyId,
          sectionId: cls.sectionId,
          roomId: cls.roomId,
          classIds: [cls.id],
        });
      }
    }

    if (room && section && room.capacity < section.studentCount) {
      conflicts.push({
        id: `cap-${cls.id}`,
        type: "capacity",
        description: `Room ${room.number} (capacity ${room.capacity}) is too small for ${section.name} (${section.studentCount} students).`,
        day: cls.day,
        period: cls.period,
        sectionId: cls.sectionId,
        roomId: cls.roomId,
        classIds: [cls.id],
      });
    }
    if (room && subject && subject.type === "lab" && room.type !== "lab") {
      conflicts.push({
        id: `lab-${cls.id}`,
        type: "lab-mismatch",
        description: `${subject.name} is a lab subject but is scheduled in ${room.number}, which is not a laboratory.`,
        day: cls.day,
        period: cls.period,
        sectionId: cls.sectionId,
        roomId: cls.roomId,
        classIds: [cls.id],
      });
    }
  }

  const clashes: [Map<string, string[]>, Conflict["type"], string][] = [
    [facultyMap, "faculty-clash", "Faculty is booked for two classes in the same slot"],
    [roomMap, "room-clash", "Room is double-booked in the same slot"],
    [sectionMap, "section-clash", "Section has two classes in the same slot"],
  ];
  for (const [map, type, label] of clashes) {
    for (const [k, ids] of map) {
      const unique = [...new Set(ids)];
      if (unique.length > 1) {
        const [day, period, entityId] = k.split("|");
        const names = unique
          .map((id) => {
            const c = classes.find((x) => x.id === id)!;
            const sub = input.subjects.find((s) => s.id === c.subjectId)?.name;
            const sec = input.sections.find((s) => s.id === c.sectionId)?.name;
            return `${sub} (${sec})`;
          })
          .join(" & ");
        conflicts.push({
          id: `${type}-${k}`,
          type,
          description: `${label}: ${names}.`,
          day: day as DayName,
          period: Number(period),
          facultyId: type === "faculty-clash" ? entityId : undefined,
          roomId: type === "room-clash" ? entityId : undefined,
          sectionId: type === "section-clash" ? entityId : undefined,
          classIds: unique,
        });
      }
    }
  }
  return conflicts;
}

export function calculateScore(
  classes: ScheduledClass[],
  input: SchedulerInput,
  unplaced: { count: number }[],
): ScheduleScore {
  const conflicts = detectConflicts(classes, input);
  const requiredSessions = buildRequirements(input).length;
  const missing = unplaced.reduce((a, u) => a + u.count, 0);
  const hardConstraints = Math.max(
    0,
    100 - conflicts.length * 10 - (requiredSessions ? (missing / requiredSessions) * 100 : 0),
  );

  // Room utilisation: how tightly rooms fit the sections + how used capacity is
  let fitSum = 0;
  for (const cls of classes) {
    const room = input.rooms.find((r) => r.id === cls.roomId);
    const section = input.sections.find((s) => s.id === cls.sectionId);
    if (room && section && room.capacity > 0)
      fitSum += Math.min(1, section.studentCount / room.capacity);
  }
  const roomUtilisation = classes.length ? (fitSum / classes.length) * 100 : 0;

  // Faculty balance: inverse of load spread
  const loads = new Map<string, number>();
  for (const cls of classes) loads.set(cls.facultyId, (loads.get(cls.facultyId) ?? 0) + 1);
  const values = [...loads.values()];
  const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const variance = values.length
    ? values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
    : 0;
  const facultyBalance = mean > 0 ? Math.max(0, 100 - (Math.sqrt(variance) / mean) * 100) : 100;

  // Student distribution: evenness of each section's classes across days
  const days = input.settings.workingDays;
  let distSum = 0;
  for (const section of input.sections) {
    const perDay = days.map(
      (d) => classes.filter((c) => c.sectionId === section.id && c.day === d).length,
    );
    const m = perDay.reduce((a, b) => a + b, 0) / days.length;
    const v = perDay.reduce((a, b) => a + (b - m) ** 2, 0) / days.length;
    distSum += m > 0 ? Math.max(0, 100 - (Math.sqrt(v) / m) * 100) : 0;
  }
  const studentDistribution = input.sections.length ? distSum / input.sections.length : 0;

  const total =
    hardConstraints * 0.45 +
    roomUtilisation * 0.2 +
    facultyBalance * 0.2 +
    studentDistribution * 0.15;

  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    total: round(total),
    hardConstraints: round(hardConstraints),
    roomUtilisation: round(roomUtilisation),
    facultyBalance: round(facultyBalance),
    studentDistribution: round(studentDistribution),
  };
}

export function generateSchedule(input: SchedulerInput, restarts = 6): Timetable {
  let best: { attempt: Attempt; score: ScheduleScore } | null = null;
  for (let i = 0; i < restarts; i++) {
    const attempt = runAttempt(input, 1000 + i * 977);
    const score = calculateScore(attempt.classes, input, attempt.unplaced);
    if (!best || score.total > best.score.total) best = { attempt, score };
    if (score.hardConstraints === 100 && score.total > 90) break;
  }
  const { attempt, score } = best!;
  return {
    id: `tt-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    published: false,
    classes: attempt.classes,
    score,
    unplaced: attempt.unplaced,
  };
}

export interface AlternativeSlot {
  day: DayName;
  period: number;
  roomId: string;
  conflictFree: boolean;
  facultyFree: boolean;
  sectionFree: boolean;
  reason?: string;
}

/** Find valid alternative slots for a class (used by rescheduling + auto-fix). */
export function findAlternativeSlots(
  cls: ScheduledClass,
  classes: ScheduledClass[],
  input: SchedulerInput,
  opts: { blockedDays?: DayName[]; limit?: number } = {},
): AlternativeSlot[] {
  const others = classes.filter((c) => c.id !== cls.id);
  const subject = input.subjects.find((s) => s.id === cls.subjectId)!;
  const section = input.sections.find((s) => s.id === cls.sectionId)!;
  const fac = input.faculty.find((f) => f.id === cls.facultyId)!;
  const occupied: Occupancy = { faculty: new Set(), room: new Set(), section: new Set() };
  for (const c of others) {
    for (const p of expandPeriods(c)) {
      occupied.faculty.add(key(c.day, p, c.facultyId));
      occupied.room.add(key(c.day, p, c.roomId));
      occupied.section.add(key(c.day, p, c.sectionId));
    }
  }

  const results: AlternativeSlot[] = [];
  for (const slot of buildSlots(input.settings)) {
    if (opts.blockedDays?.includes(slot.day)) continue;
    if (slot.day === cls.day && slot.period === cls.period) continue;
    const periods = sessionPeriods(input.settings, slot.period, cls.duration);
    if (!periods) continue;
    const facultyFree =
      periods.every((p) => !occupied.faculty.has(key(slot.day, p, fac.id))) &&
      periods.every((p) => fac.availability[slot.day]?.[p] !== false);
    const sectionFree = periods.every((p) => !occupied.section.has(key(slot.day, p, section.id)));
    if (!facultyFree || !sectionFree) continue;
    const dayLoad = others.filter((c) => c.facultyId === fac.id && c.day === slot.day).length;
    if (dayLoad + 1 > fac.maxClassesPerDay) continue;
    const room = allocateClassroom(input.rooms, subject, section, slot.day, periods, occupied);
    if (!room) continue;
    results.push({
      day: slot.day,
      period: slot.period,
      roomId: room.id,
      conflictFree: true,
      facultyFree,
      sectionFree,
    });
    if (opts.limit && results.length >= opts.limit) break;
  }
  return results;
}

/** Try to repair a conflict by moving one of the involved classes. */
export function autoFixConflict(
  conflict: Conflict,
  classes: ScheduledClass[],
  input: SchedulerInput,
): { classes: ScheduledClass[]; fixed: boolean; message: string } {
  for (const classId of [...conflict.classIds].reverse()) {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) continue;

    // Capacity / lab mismatch: try a better room in the same slot first.
    if (conflict.type === "capacity" || conflict.type === "lab-mismatch") {
      const occupied: Occupancy = { faculty: new Set(), room: new Set(), section: new Set() };
      for (const c of classes.filter((c) => c.id !== cls.id))
        for (const p of expandPeriods(c)) occupied.room.add(key(c.day, p, c.roomId));
      const subject = input.subjects.find((s) => s.id === cls.subjectId)!;
      const section = input.sections.find((s) => s.id === cls.sectionId)!;
      const room = allocateClassroom(
        input.rooms,
        subject,
        section,
        cls.day,
        expandPeriods(cls),
        occupied,
      );
      if (room) {
        return {
          classes: classes.map((c) => (c.id === cls.id ? { ...c, roomId: room.id } : c)),
          fixed: true,
          message: `Reassigned to ${room.number} (capacity ${room.capacity}).`,
        };
      }
    }

    const alts = findAlternativeSlots(cls, classes, input, { limit: 1 });
    if (alts.length) {
      const alt = alts[0];
      return {
        classes: classes.map((c) =>
          c.id === cls.id ? { ...c, day: alt.day, period: alt.period, roomId: alt.roomId } : c,
        ),
        fixed: true,
        message: `Moved to ${alt.day}, period ${alt.period + 1}.`,
      };
    }
  }
  return { classes, fixed: false, message: "No conflict-free alternative slot available." };
}

export function roomUtilisationStats(classes: ScheduledClass[], input: SchedulerInput) {
  const totalSlots = buildSlots(input.settings).length;
  return input.rooms.map((room) => {
    const used = classes
      .filter((c) => c.roomId === room.id)
      .reduce((a, c) => a + expandPeriods(c).length, 0);
    return {
      room,
      used,
      totalSlots,
      utilisation: totalSlots ? Math.round((used / totalSlots) * 100) : 0,
    };
  });
}

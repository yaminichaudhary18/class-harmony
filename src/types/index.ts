export type Role = "admin" | "faculty" | "student";

export type DayName = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export interface Period {
  index: number;
  label: string; // "09:00 - 10:00"
  isBreak?: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  facultyId: string;
  department: string;
  email: string;
  maxClassesPerDay: number;
  /** availability[day][periodIndex] = true when free to teach */
  availability: Record<string, boolean[]>;
}

export interface Section {
  id: string;
  name: string;
  course: string;
  semester: number;
  studentCount: number;
  subjectIds: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  type: "theory" | "lab";
  classesPerWeek: number;
  facultyId: string;
  /** periods per session (labs are usually 2 consecutive) */
  duration: 1 | 2;
}

export type RoomType = "classroom" | "seminar" | "lab";

export interface Room {
  id: string;
  number: string;
  building: string;
  floor: number;
  capacity: number;
  type: RoomType;
  projector: boolean;
  smartBoard: boolean;
  computers: number;
  equipment?: string | undefined;
  software?: string | undefined;
  status: "available" | "maintenance";
}

export interface SoftConstraintFlags {
  avoidFacultyConsecutive: boolean;
  avoidStudentConsecutive: boolean;
  spreadSubjectAcrossDays: boolean;
  balanceFacultyWorkload: boolean;
  minimiseRoomWastage: boolean;
  avoidEdgePeriods: boolean;
}

export interface Settings {
  collegeName: string;
  academicYear: string;
  workingDays: DayName[];
  periods: Period[];
  maxClassesPerDayDefault: number;
  softConstraints: SoftConstraintFlags;
}

export interface ScheduledClass {
  id: string;
  day: DayName;
  period: number;
  duration: 1 | 2;
  sectionId: string;
  subjectId: string;
  facultyId: string;
  roomId: string;
}

export interface Conflict {
  id: string;
  type:
    | "faculty-clash"
    | "room-clash"
    | "section-clash"
    | "capacity"
    | "lab-mismatch"
    | "availability";
  description: string;
  day: DayName;
  period: number;
  facultyId?: string | undefined;
  sectionId?: string | undefined;
  roomId?: string | undefined;
  classIds: string[];
}

export interface ScheduleScore {
  total: number;
  hardConstraints: number;
  roomUtilisation: number;
  facultyBalance: number;
  studentDistribution: number;
}

export interface Timetable {
  id: string;
  generatedAt: string;
  published: boolean;
  classes: ScheduledClass[];
  score: ScheduleScore;
  unplaced: { sectionId: string; subjectId: string; count: number }[];
}

export interface AppNotification {
  id: string;
  role: Role | "all";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string | undefined;
}

export interface Activity {
  id: string;
  message: string;
  at: string;
}

export interface RescheduleRequest {
  id: string;
  facultyId: string;
  classId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AppUser {
  role: Role;
  name: string;
  email: string;
  facultyId?: string | undefined;
  sectionId?: string | undefined;
}

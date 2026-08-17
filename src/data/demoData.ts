import type {
  DayName,
  Faculty,
  Period,
  Room,
  Section,
  Settings,
  Subject,
} from "@/types";

export const DAYS: DayName[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const PERIODS: Period[] = [
  { index: 0, label: "09:00 - 10:00" },
  { index: 1, label: "10:00 - 11:00" },
  { index: 2, label: "11:00 - 12:00" },
  { index: 3, label: "12:00 - 12:45", isBreak: true },
  { index: 4, label: "12:45 - 13:45" },
  { index: 5, label: "13:45 - 14:45" },
  { index: 6, label: "14:45 - 15:45" },
];

export const TEACHING_PERIODS = PERIODS.filter((p) => !p.isBreak).map((p) => p.index);

function fullAvailability(blocked: Partial<Record<DayName, number[]>> = {}) {
  const map: Record<string, boolean[]> = {};
  for (const day of DAYS) {
    map[day] = PERIODS.map((p) => !(blocked[day] ?? []).includes(p.index));
  }
  return map;
}

export const demoFaculty: Faculty[] = [
  {
    id: "f1",
    name: "Dr. Anil Sharma",
    facultyId: "FAC-101",
    department: "CSE",
    email: "anil.sharma@college.edu",
    maxClassesPerDay: 4,
    availability: fullAvailability({ Wed: [0, 1, 2] }),
  },
  {
    id: "f2",
    name: "Dr. Meera Iyer",
    facultyId: "FAC-102",
    department: "CSE",
    email: "meera.iyer@college.edu",
    maxClassesPerDay: 4,
    availability: fullAvailability({ Fri: [5, 6] }),
  },
  {
    id: "f3",
    name: "Prof. Rajesh Kumar",
    facultyId: "FAC-103",
    department: "CSE",
    email: "rajesh.kumar@college.edu",
    maxClassesPerDay: 5,
    availability: fullAvailability({ Mon: [6], Thu: [0] }),
  },
  {
    id: "f4",
    name: "Dr. Sunita Rao",
    facultyId: "FAC-104",
    department: "CSE",
    email: "sunita.rao@college.edu",
    maxClassesPerDay: 4,
    availability: fullAvailability({ Tue: [0, 1] }),
  },
  {
    id: "f5",
    name: "Prof. Vikram Nair",
    facultyId: "FAC-105",
    department: "CSE",
    email: "vikram.nair@college.edu",
    maxClassesPerDay: 5,
    availability: fullAvailability(),
  },
  {
    id: "f6",
    name: "Dr. Kavita Desai",
    facultyId: "FAC-106",
    department: "Mathematics",
    email: "kavita.desai@college.edu",
    maxClassesPerDay: 5,
    availability: fullAvailability({ Wed: [5, 6] }),
  },
  {
    id: "f7",
    name: "Prof. Arjun Menon",
    facultyId: "FAC-107",
    department: "ECE",
    email: "arjun.menon@college.edu",
    maxClassesPerDay: 4,
    availability: fullAvailability({ Mon: [0] }),
  },
  {
    id: "f8",
    name: "Dr. Priya Verma",
    facultyId: "FAC-108",
    department: "ECE",
    email: "priya.verma@college.edu",
    maxClassesPerDay: 4,
    availability: fullAvailability({ Thu: [5, 6] }),
  },
  {
    id: "f9",
    name: "Prof. Sanjay Gupta",
    facultyId: "FAC-109",
    department: "CSE",
    email: "sanjay.gupta@college.edu",
    maxClassesPerDay: 5,
    availability: fullAvailability(),
  },
  {
    id: "f10",
    name: "Dr. Neha Bansal",
    facultyId: "FAC-110",
    department: "Humanities",
    email: "neha.bansal@college.edu",
    maxClassesPerDay: 4,
    availability: fullAvailability({ Fri: [0, 1] }),
  },
  {
    id: "f11",
    name: "Prof. Imran Khan",
    facultyId: "FAC-111",
    department: "CSE",
    email: "imran.khan@college.edu",
    maxClassesPerDay: 5,
    availability: fullAvailability(),
  },
  {
    id: "f12",
    name: "Dr. Lakshmi Pillai",
    facultyId: "FAC-112",
    department: "ECE",
    email: "lakshmi.pillai@college.edu",
    maxClassesPerDay: 4,
    availability: fullAvailability({ Tue: [6] }),
  },
];

export const demoSubjects: Subject[] = [
  { id: "s1", name: "Data Structures", code: "CS201", credits: 4, type: "theory", classesPerWeek: 4, facultyId: "f1", duration: 1 },
  { id: "s2", name: "Database Management Systems", code: "CS202", credits: 4, type: "theory", classesPerWeek: 4, facultyId: "f2", duration: 1 },
  { id: "s3", name: "Operating Systems", code: "CS203", credits: 3, type: "theory", classesPerWeek: 3, facultyId: "f3", duration: 1 },
  { id: "s4", name: "Computer Networks", code: "CS204", credits: 3, type: "theory", classesPerWeek: 3, facultyId: "f4", duration: 1 },
  { id: "s5", name: "Discrete Mathematics", code: "MA201", credits: 4, type: "theory", classesPerWeek: 3, facultyId: "f6", duration: 1 },
  { id: "s6", name: "Python Programming", code: "CS205", credits: 3, type: "theory", classesPerWeek: 3, facultyId: "f5", duration: 1 },
  { id: "s7", name: "Software Engineering", code: "CS206", credits: 3, type: "theory", classesPerWeek: 3, facultyId: "f9", duration: 1 },
  { id: "s8", name: "Technical Communication", code: "HS201", credits: 2, type: "theory", classesPerWeek: 2, facultyId: "f10", duration: 1 },
  { id: "s9", name: "Digital Electronics", code: "EC201", credits: 4, type: "theory", classesPerWeek: 4, facultyId: "f7", duration: 1 },
  { id: "s10", name: "Signals and Systems", code: "EC202", credits: 4, type: "theory", classesPerWeek: 3, facultyId: "f8", duration: 1 },
  { id: "s11", name: "Microprocessors", code: "EC203", credits: 3, type: "theory", classesPerWeek: 3, facultyId: "f12", duration: 1 },
  { id: "s12", name: "DBMS Lab", code: "CS252", credits: 2, type: "lab", classesPerWeek: 1, facultyId: "f2", duration: 2 },
  { id: "s13", name: "Python Programming Lab", code: "CS255", credits: 2, type: "lab", classesPerWeek: 1, facultyId: "f5", duration: 2 },
  { id: "s14", name: "Data Structures Lab", code: "CS251", credits: 2, type: "lab", classesPerWeek: 1, facultyId: "f11", duration: 2 },
  { id: "s15", name: "Networks Lab", code: "CS254", credits: 2, type: "lab", classesPerWeek: 1, facultyId: "f4", duration: 2 },
  { id: "s16", name: "Electronics Lab", code: "EC251", credits: 2, type: "lab", classesPerWeek: 1, facultyId: "f7", duration: 2 },
  { id: "s17", name: "Operating Systems Lab", code: "CS253", credits: 2, type: "lab", classesPerWeek: 1, facultyId: "f3", duration: 2 },
];

export const demoSections: Section[] = [
  {
    id: "sec1",
    name: "CSE-A",
    course: "B.Tech Computer Science",
    semester: 4,
    studentCount: 62,
    subjectIds: ["s1", "s2", "s3", "s5", "s6", "s12", "s13"],
  },
  {
    id: "sec2",
    name: "CSE-B",
    course: "B.Tech Computer Science",
    semester: 4,
    studentCount: 58,
    subjectIds: ["s1", "s2", "s4", "s6", "s7", "s14", "s15"],
  },
  {
    id: "sec3",
    name: "CSE-C",
    course: "B.Tech Computer Science",
    semester: 4,
    studentCount: 38,
    subjectIds: ["s2", "s3", "s5", "s7", "s8", "s12", "s17"],
  },
  {
    id: "sec4",
    name: "ECE-A",
    course: "B.Tech Electronics",
    semester: 4,
    studentCount: 55,
    subjectIds: ["s9", "s10", "s11", "s5", "s8", "s16"],
  },
  {
    id: "sec5",
    name: "ECE-B",
    course: "B.Tech Electronics",
    semester: 4,
    studentCount: 34,
    subjectIds: ["s9", "s10", "s11", "s6", "s16", "s13"],
  },
];

export const demoRooms: Room[] = [
  { id: "r1", number: "101", building: "Block A", floor: 1, capacity: 30, type: "classroom", projector: true, smartBoard: false, computers: 0, status: "available" },
  { id: "r2", number: "102", building: "Block A", floor: 1, capacity: 40, type: "classroom", projector: true, smartBoard: false, computers: 0, status: "available" },
  { id: "r3", number: "103", building: "Block A", floor: 1, capacity: 60, type: "classroom", projector: true, smartBoard: true, computers: 0, status: "available" },
  { id: "r4", number: "104", building: "Block A", floor: 2, capacity: 120, type: "seminar", projector: true, smartBoard: true, computers: 0, status: "available" },
  { id: "r5", number: "201", building: "Block B", floor: 2, capacity: 65, type: "classroom", projector: true, smartBoard: true, computers: 0, status: "available" },
  { id: "r6", number: "202", building: "Block B", floor: 2, capacity: 45, type: "classroom", projector: false, smartBoard: false, computers: 0, status: "available" },
  { id: "r7", number: "204", building: "Block B", floor: 2, capacity: 70, type: "classroom", projector: true, smartBoard: true, computers: 0, status: "available" },
  { id: "r8", number: "205", building: "Block B", floor: 3, capacity: 55, type: "classroom", projector: true, smartBoard: false, computers: 0, status: "available" },
  { id: "r9", number: "301", building: "Block C", floor: 3, capacity: 80, type: "seminar", projector: true, smartBoard: true, computers: 0, status: "available" },
  {
    id: "l1", number: "Programming Lab", building: "Block C", floor: 1, capacity: 65, type: "lab",
    projector: true, smartBoard: true, computers: 65, equipment: "Workstations, Server rack",
    software: "VS Code, Python, PostgreSQL", status: "available",
  },
  {
    id: "l2", number: "Networks Lab", building: "Block C", floor: 2, capacity: 60, type: "lab",
    projector: true, smartBoard: false, computers: 45, equipment: "Routers, Switches, Cisco kits",
    software: "Packet Tracer, Wireshark", status: "available",
  },
  {
    id: "l3", number: "Electronics Lab", building: "Block D", floor: 1, capacity: 60, type: "lab",
    projector: true, smartBoard: false, computers: 25, equipment: "CROs, Function generators, FPGA kits",
    software: "MATLAB, Multisim", status: "available",
  },
];

export const defaultSettings: Settings = {
  collegeName: "National Institute of Engineering",
  academicYear: "2026 - 2027",
  workingDays: DAYS,
  periods: PERIODS,
  maxClassesPerDayDefault: 5,
  softConstraints: {
    avoidFacultyConsecutive: true,
    avoidStudentConsecutive: true,
    spreadSubjectAcrossDays: true,
    balanceFacultyWorkload: true,
    minimiseRoomWastage: true,
    avoidEdgePeriods: true,
  },
};

export const demoCredentials = [
  { role: "admin" as const, email: "admin@college.edu", password: "admin123", name: "Admin Console" },
  { role: "faculty" as const, email: "anil.sharma@college.edu", password: "faculty123", name: "Dr. Anil Sharma", facultyId: "f1" },
  { role: "student" as const, email: "student.csea@college.edu", password: "student123", name: "Riya Menon (CSE-A)", sectionId: "sec1" },
];

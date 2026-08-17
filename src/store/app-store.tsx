import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultSettings,
  demoFaculty,
  demoRooms,
  demoSections,
  demoSubjects,
} from "@/data/demoData";
import type {
  Activity,
  AppNotification,
  AppUser,
  Faculty,
  RescheduleRequest,
  Room,
  ScheduledClass,
  Section,
  Settings,
  Subject,
  Timetable,
} from "@/types";
import type { SchedulerInput } from "@/scheduler";

const STORAGE_KEY = "sih-smart-scheduler-v1";
const USER_KEY = "sih-smart-scheduler-user";

interface PersistedState {
  faculty: Faculty[];
  sections: Section[];
  subjects: Subject[];
  rooms: Room[];
  settings: Settings;
  timetable: Timetable | null;
  notifications: AppNotification[];
  activities: Activity[];
  requests: RescheduleRequest[];
}

const initialState: PersistedState = {
  faculty: demoFaculty,
  sections: demoSections,
  subjects: demoSubjects,
  rooms: demoRooms,
  settings: defaultSettings,
  timetable: null,
  notifications: [
    {
      id: "n1",
      role: "admin",
      title: "Welcome to Smart Scheduler",
      message: "Demo data is loaded. Open the Smart Scheduler to generate a timetable.",
      createdAt: new Date().toISOString(),
      read: false,
      link: "/admin/scheduler",
    },
  ],
  activities: [
    { id: "a1", message: "Demo academic data loaded", at: new Date().toISOString() },
  ],
  requests: [],
};

interface StoreValue extends PersistedState {
  ready: boolean;
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  update: (patch: Partial<PersistedState>) => void;
  setTimetable: (t: Timetable | null) => void;
  updateClasses: (classes: ScheduledClass[]) => void;
  notify: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  logActivity: (message: string) => void;
  resetDemoData: () => void;
  schedulerInput: SchedulerInput;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [user, setUserState] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as PersistedState) });
      const rawUser = localStorage.getItem(USER_KEY);
      if (rawUser) setUserState(JSON.parse(rawUser) as AppUser);
    } catch {
      /* ignore corrupted storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [state, ready]);

  const setUser = useCallback((u: AppUser | null) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
      else localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((patch: Partial<PersistedState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setTimetable = useCallback((t: Timetable | null) => {
    setState((prev) => ({ ...prev, timetable: t }));
  }, []);

  const updateClasses = useCallback((classes: ScheduledClass[]) => {
    setState((prev) =>
      prev.timetable ? { ...prev, timetable: { ...prev.timetable, classes } } : prev,
    );
  }, []);

  const notify = useCallback((n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setState((prev) => ({
      ...prev,
      notifications: [
        {
          ...n,
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev.notifications,
      ].slice(0, 60),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const logActivity = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      activities: [
        { id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, message, at: new Date().toISOString() },
        ...prev.activities,
      ].slice(0, 40),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    setState(initialState);
  }, []);

  const schedulerInput = useMemo<SchedulerInput>(
    () => ({
      faculty: state.faculty,
      sections: state.sections,
      subjects: state.subjects,
      rooms: state.rooms,
      settings: state.settings,
    }),
    [state.faculty, state.sections, state.subjects, state.rooms, state.settings],
  );

  const value: StoreValue = {
    ...state,
    ready,
    user,
    setUser,
    update,
    setTimetable,
    updateClasses,
    notify,
    markNotificationRead,
    logActivity,
    resetDemoData,
    schedulerInput,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider");
  return ctx;
}

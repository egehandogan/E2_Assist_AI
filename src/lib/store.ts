import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  assignee?: string | null;
  dueDate?: string | null;
  priority: "urgent" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  category?: string | null;
  meetingId?: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  title?: string | null;
  content: string;
  source: "manual" | "phone" | "meeting";
  tags?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  location?: string | null;
  meetLink?: string | null;
  attendees?: string | null;
  status: string;
  notes?: string | null;
  summary?: string | null;
  transcript?: string | null;
  aiJoined: boolean;
  tasks?: Task[];
}

// ─── Tasks Store ──────────────────────────────────────────────────────────────

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (data: Partial<Task>) => Promise<Task | null>;
  update: (id: string, data: Partial<Task>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      set({ tasks: Array.isArray(data) ? data : [] });
    } finally {
      set({ loading: false });
    }
  },

  add: async (data) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const task = await res.json();
    set((s) => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  update: async (id, data) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const updated = await res.json();
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
  },

  remove: async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  toggle: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await get().update(id, { status: newStatus });
  },
}));

// ─── Notes Store ──────────────────────────────────────────────────────────────

interface NoteStore {
  notes: Note[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (data: Partial<Note>) => Promise<Note | null>;
  update: (id: string, data: Partial<Note>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      set({ notes: Array.isArray(data) ? data : [] });
    } finally {
      set({ loading: false });
    }
  },

  add: async (data) => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const note = await res.json();
    set((s) => ({ notes: [note, ...s.notes] }));
    return note;
  },

  update: async (id, data) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const updated = await res.json();
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? updated : n)) }));
  },

  remove: async (id) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },
}));

// ─── Meetings Store ───────────────────────────────────────────────────────────

interface MeetingStore {
  meetings: Meeting[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (data: Partial<Meeting>) => Promise<Meeting | null>;
  update: (id: string, data: Partial<Meeting>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  meetings: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      set({ meetings: Array.isArray(data) ? data : [] });
    } finally {
      set({ loading: false });
    }
  },

  add: async (data) => {
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const meeting = await res.json();
    set((s) => ({ meetings: [...s.meetings, meeting] }));
    return meeting;
  },

  update: async (id, data) => {
    const res = await fetch(`/api/meetings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const updated = await res.json();
    set((s) => ({ meetings: s.meetings.map((m) => (m.id === id ? updated : m)) }));
  },

  remove: async (id) => {
    await fetch(`/api/meetings/${id}`, { method: "DELETE" });
    set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) }));
  },
}));

// ─── AI Helper ────────────────────────────────────────────────────────────────

export async function aiAnalyze(type: string, content: string): Promise<{ result?: string; tasks?: Task[]; error?: string }> {
  try {
    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content }),
    });
    return await res.json();
  } catch {
    return { error: "Bağlantı hatası" };
  }
}

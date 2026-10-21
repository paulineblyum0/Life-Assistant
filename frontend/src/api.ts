const API = `http://${window.location.hostname}:8000`;

export type Task = {
  id: number;
  title: string;
  notes: string | null;
  completed: boolean;
  priority: 1 | 2 | 3;
  due_date: string | null;
  created_at: string;
};

export type TaskCreate = {
  title: string;
  priority?: number;
  due_date?: string | null;
  notes?: string | null;
};

export type TaskUpdate = Partial<TaskCreate> & { completed?: boolean };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const getTasks = () => request<Task[]>("/tasks");

export const createTask = (task: TaskCreate) =>
  request<Task>("/tasks", { method: "POST", body: JSON.stringify(task) });

export const updateTask = (id: number, updates: TaskUpdate) =>
  request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(updates) });

export const deleteTask = (id: number) =>
  request<void>(`/tasks/${id}`, { method: "DELETE" });

export type Category = "physical" | "creative" | "social" | "relaxing" | "learning";
export const CATEGORIES: Category[] = ["physical", "creative", "social", "relaxing", "learning"];

export type Activity = {
  id: number;
  name: string;
  category: Category;
  duration_minutes: number;
  energy: 1 | 2 | 3;
  notes: string | null;
  created_at: string;
};

export type ActivityCreate = {
  name: string;
  category: Category;
  duration_minutes: number;
  energy: number;
  notes?: string | null;
};

export type ActivityFilters = {
  max_minutes?: number;
  max_energy?: number;
};

export function getActivities(filters: ActivityFilters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return request<Activity[]>(`/activities${qs ? `?${qs}` : ""}`);
}

export const createActivity = (activity: ActivityCreate) =>
  request<Activity>("/activities", { method: "POST", body: JSON.stringify(activity) });

export const deleteActivity = (id: number) =>
  request<void>(`/activities/${id}`, { method: "DELETE" });
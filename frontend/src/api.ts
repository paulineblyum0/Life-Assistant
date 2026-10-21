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
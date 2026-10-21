import { useEffect, useState, type FormEvent } from "react";
import { type Task, getTasks, createTask, updateTask, deleteTask } from "../api";
import TaskItem from "../components/TaskItem";
import { formatDate, todayISO } from "../dates";

type View = "today" | "upcoming";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>("today");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState(2);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setTasks(await getTasks());
      setError(null);
    } catch {
      setError("Couldn't reach the backend");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask({ title: title.trim(), priority, due_date: dueDate || null });
    setTitle("");
    setPriority(2);
    setDueDate("");
    load();
  }

  async function toggle(task: Task) {
    await updateTask(task.id, { completed: !task.completed });
    load();
  }

  async function remove(id: number) {
    await deleteTask(id);
    load();
  }

  const today = todayISO();
  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  // Today = due today, overdue, or no date at all
  const todayTasks = open.filter((t) => !t.due_date || t.due_date <= today);

  // Upcoming = due after today, grouped by date
  const upcoming = open
    .filter((t) => t.due_date && t.due_date > today)
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!) || a.priority - b.priority);
  const groups: Record<string, Task[]> = {};
  for (const t of upcoming) (groups[t.due_date!] ??= []).push(t);

  const itemProps = { onToggle: toggle, onDelete: remove };

  return (
    <main className="app">
      <h1>Tasks</h1>

      <div className="segmented">
        <button className={view === "today" ? "active" : ""} onClick={() => setView("today")}>
          Today ({todayTasks.length})
        </button>
        <button className={view === "upcoming" ? "active" : ""} onClick={() => setView("upcoming")}>
          Upcoming ({upcoming.length})
        </button>
      </div>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          className="full"
          placeholder="Add a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
          <option value={1}>High</option>
          <option value={2}>Medium</option>
          <option value={3}>Low</option>
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit" className="primary full">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      {view === "today" &&
        (todayTasks.length === 0 ? (
          <p className="empty">Nothing for today. Nice.</p>
        ) : (
          <ul className="card-list">
            {todayTasks.map((t) => <TaskItem key={t.id} task={t} {...itemProps} />)}
          </ul>
        ))}

      {view === "upcoming" &&
        (upcoming.length === 0 ? (
          <p className="empty">Nothing scheduled yet.</p>
        ) : (
          Object.entries(groups).map(([date, list]) => (
            <section key={date}>
              <h2 className="group-heading">{formatDate(date)}</h2>
              <ul className="card-list">
                {list.map((t) => <TaskItem key={t.id} task={t} {...itemProps} />)}
              </ul>
            </section>
          ))
        ))}

      {done.length > 0 && (
        <details>
          <summary>Completed ({done.length})</summary>
          <ul className="card-list">
            {done.map((t) => <TaskItem key={t.id} task={t} {...itemProps} />)}
          </ul>
        </details>
      )}
    </main>
  );
}
import { useEffect, useState, type FormEvent } from "react";
import { type Task, getTasks, createTask, updateTask, deleteTask } from "../api";
import TaskItem from "../components/TaskItem";
import ErrorBanner from "../components/ErrorBanner";
import Loading from "../components/Loading";
import { formatDate, todayISO } from "../dates";

type View = "today" | "upcoming";

const OFFLINE = "Couldn't reach the backend. Is it running?";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>("today");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState(2);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    getTasks()
      .then((data) => {
        setTasks(data);
        setError(null);
      })
      .catch(() => setError(OFFLINE))
      .finally(() => setLoading(false));

  // Runs a change, then refreshes the list. Shows a message instead of failing silently.
  async function run(action: () => Promise<unknown>, failMessage: string) {
    try {
      await action();
      await load();
    } catch {
      setError(failMessage);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    await run(async () => {
      await createTask({ title: title.trim(), priority, due_date: dueDate || null });
      setTitle("");
      setPriority(2);
      setDueDate("");
    }, "Couldn't add that task. Try again.");
    setSaving(false);
  }

  const toggle = (task: Task) =>
    run(() => updateTask(task.id, { completed: !task.completed }), "Couldn't update that task.");

  const remove = (id: number) => run(() => deleteTask(id), "Couldn't delete that task.");

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

  // Only show lists once we have data; if the backend is down and we have nothing, the banner says enough
  const showLists = !loading && !(error && tasks.length === 0);

  return (
    <main className="app">
      <h1>Tasks</h1>

      <div className="segmented">
        <button className={view === "today" ? "active" : ""} onClick={() => setView("today")}>
          Today{!loading && ` (${todayTasks.length})`}
        </button>
        <button className={view === "upcoming" ? "active" : ""} onClick={() => setView("upcoming")}>
          Upcoming{!loading && ` (${upcoming.length})`}
        </button>
      </div>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          className="full"
          placeholder="Add a task..."
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(Number(e.target.value))} aria-label="Priority">
          <option value={1}>High</option>
          <option value={2}>Medium</option>
          <option value={3}>Low</option>
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Due date" />
        <button type="submit" className="primary full" disabled={saving || !title.trim()}>
          {saving ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading && <Loading label="Loading tasks..." />}

      {showLists && view === "today" &&
        (todayTasks.length === 0 ? (
          <p className="empty">
            {tasks.length === 0 ? "No tasks yet. Add your first one above." : "Nothing for today. Nice."}
          </p>
        ) : (
          <ul className="card-list">
            {todayTasks.map((t) => <TaskItem key={t.id} task={t} {...itemProps} />)}
          </ul>
        ))}

      {showLists && view === "upcoming" &&
        (upcoming.length === 0 ? (
          <p className="empty">Nothing scheduled. Give a task a due date and it'll show up here.</p>
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

      {showLists && done.length > 0 && (
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

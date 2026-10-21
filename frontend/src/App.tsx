import { useEffect, useState, type FormEvent } from "react";
import { type Task, getTasks, createTask, updateTask, deleteTask } from "./api";

const PRIORITY_LABEL = { 1: "High", 2: "Medium", 3: "Low" } as const;

function formatDate(d: string) {
  return new Date(d + "T00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  function TaskItem({ task }: { task: Task }) {
    return (
      <li className={`task ${task.completed ? "done" : ""}`}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggle(task)}
          aria-label={`Mark "${task.title}" as done`}
        />
        <div className="task-body">
          <div className="task-title">{task.title}</div>
          <div className="meta">
            <span className={`pill p${task.priority}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
            {task.due_date && <span>{formatDate(task.due_date)}</span>}
          </div>
        </div>
        <button className="delete" onClick={() => remove(task.id)} aria-label="Delete task">
          ×
        </button>
      </li>
    );
  }

  return (
    <main className="app">
      <h1>Today</h1>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
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
        <button type="submit" className="primary">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      {open.length === 0 && !error ? (
        <p className="empty">Nothing to do. Nice.</p>
      ) : (
        <ul className="task-list">
          {open.map((t) => <TaskItem key={t.id} task={t} />)}
        </ul>
      )}

      {done.length > 0 && (
        <details>
          <summary>Completed ({done.length})</summary>
          <ul className="task-list">
            {done.map((t) => <TaskItem key={t.id} task={t} />)}
          </ul>
        </details>
      )}
    </main>
  );
}
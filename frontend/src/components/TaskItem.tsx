import type { Task } from "../api";
import { formatDate, todayISO } from "../dates";

const PRIORITY_LABEL = { 1: "High", 2: "Medium", 3: "Low" } as const;

type Props = {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: number) => void;
};

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  const overdue = !task.completed && task.due_date !== null && task.due_date < todayISO();

  return (
    <li className={`card ${task.completed ? "done" : ""}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={`Mark "${task.title}" as done`}
      />
      <div className="card-body">
        <div className="card-title">{task.title}</div>
        <div className="meta">
          <span className={`pill p${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
          {task.due_date && (
            <span className={overdue ? "overdue" : ""}>
              {overdue ? "Overdue · " : ""}
              {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>
      <button className="delete" onClick={() => onDelete(task.id)} aria-label="Delete task">
        ×
      </button>
    </li>
  );
}
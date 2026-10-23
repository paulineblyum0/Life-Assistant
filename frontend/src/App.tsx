import { useState } from "react";
import TasksPage from "./pages/TasksPage";
import ActivitiesPage from "./pages/ActivitiesPage";

type Tab = "tasks" | "activities";

export default function App() {
  const [tab, setTab] = useState<Tab>("tasks");

  return (
    <>
      {tab === "tasks" ? <TasksPage /> : <ActivitiesPage />}

      <nav className="tab-bar">
        <button className={tab === "tasks" ? "active" : ""} onClick={() => setTab("tasks")}>
          Tasks
        </button>
        <button className={tab === "activities" ? "active" : ""} onClick={() => setTab("activities")}>
          Activities
        </button>
      </nav>
    </>
  );
}
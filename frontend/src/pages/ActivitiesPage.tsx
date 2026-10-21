import { useEffect, useState, type FormEvent } from "react";
import {
  type Activity,
  type ActivityFilters,
  type Category,
  CATEGORIES,
  createActivity,
  deleteActivity,
  getActivities,
} from "../api";

const ENERGY_LABEL = { 1: "Low energy", 2: "Medium energy", 3: "High energy" } as const;

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [pick, setPick] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("physical");
  const [duration, setDuration] = useState("");
  const [energy, setEnergy] = useState(2);

  async function load() {
    try {
      setActivities(await getActivities(filters));
      setError(null);
    } catch {
      setError("Couldn't reach the backend");
    }
  }

  useEffect(() => {
    load();
    setPick(null);
  }, [filters]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !duration) return;
    await createActivity({
      name: name.trim(),
      category,
      duration_minutes: Number(duration),
      energy,
    });
    setName("");
    setDuration("");
    load();
  }

  async function remove(id: number) {
    await deleteActivity(id);
    if (pick?.id === id) setPick(null);
    load();
  }

  function surpriseMe() {
    if (activities.length === 0) return;
    setPick(activities[Math.floor(Math.random() * activities.length)]);
  }

  function setFilter(key: keyof ActivityFilters, value: string) {
    setFilters((f) => ({ ...f, [key]: value ? Number(value) : undefined }));
  }

  return (
    <main className="app">
      <h1>Activities</h1>

      <div className="filters">
        <select value={filters.max_minutes ?? ""} onChange={(e) => setFilter("max_minutes", e.target.value)}>
          <option value="">Any time</option>
          <option value="15">15 min</option>
          <option value="30">30 min</option>
          <option value="60">1 hour</option>
          <option value="120">2 hours</option>
        </select>
        <select value={filters.max_energy ?? ""} onChange={(e) => setFilter("max_energy", e.target.value)}>
          <option value="">Any energy</option>
          <option value="1">Low energy</option>
          <option value="2">Medium or less</option>
        </select>
      </div>

      <button className="primary surprise" onClick={surpriseMe} disabled={activities.length === 0}>
        Surprise me
      </button>

      {pick && (
        <div className="pick">
          How about <strong>{pick.name}</strong>? ({pick.duration_minutes} min)
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {activities.length === 0 ? (
        <p className="empty">No activities match. Add some below.</p>
      ) : (
        <ul className="card-list">
          {activities.map((a) => (
            <li key={a.id} className="card">
              <div className="card-body">
                <div className="card-title">{a.name}</div>
                <div className="meta">
                  <span className="pill cat">{a.category}</span>
                  <span>{a.duration_minutes} min</span>
                  <span>{ENERGY_LABEL[a.energy]}</span>
                </div>
              </div>
              <button className="delete" onClick={() => remove(a.id)} aria-label="Delete activity">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="group-heading">Add an activity</h2>
      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          className="full"
          placeholder="e.g. Tennis, bake bread, call a friend"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={energy} onChange={(e) => setEnergy(Number(e.target.value))}>
          <option value={1}>Low energy</option>
          <option value={2}>Medium energy</option>
          <option value={3}>High energy</option>
        </select>
        <input
          type="number"
          className="full"
          inputMode="numeric"
          min={5}
          max={600}
          placeholder="How many minutes?"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <button type="submit" className="primary full">Add activity</button>
      </form>
    </main>
  );
}

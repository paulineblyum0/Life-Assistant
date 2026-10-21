import { useEffect, useState } from "react";

const API = `http://${window.location.hostname}:8000`;

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return <h1>Backend: {status}</h1>;
}
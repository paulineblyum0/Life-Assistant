# Life Assistant

Most productivity apps are built around rigid to-do lists and schedules, without accounting for the fact that our energy, motivation and priorities change from day to day. It's easy to overplan, fall behind and end up feeling less productive as a result.

Life Assistant aims to offer a more flexible approach. Rather than just tracking tasks, it's designed to learn your preferences and routines, help you adjust plans when circumstances change and suggest alternative activities based on your time, energy and interests. The goal is to make it easier to stay productive while also making time for things you enjoy.

It runs as a progressive web app (PWA), so it works on a laptop and installs on a phone like a native app, with no App Store in the way.


---

## Where it's going

| Phase | What it adds |
| --- | --- |
| **1. Core app** *(in progress)* | Daily dashboard, tasks, date-based schedule, activity library. No AI. |
| **2. LLM companion** | A chat assistant that knows your tasks and schedule. *"I'm overwhelmed, help me sort my evening."* |
| **3. Personalisation & memory** | Embeddings and retrieval over your preferences and past interactions, so suggestions get more *you* over time. |
| **4. Voice & agents** | Talk to it, and let it act: adding tasks or reshuffling your day, always with your approval. |
| **5. Custom ML recommender** | A purpose-built recommendation model (starting with logistic regression, random forests and gradient-boosted trees), properly evaluated against simple baselines. |

The end goal: an assistant that doesn't just store your life, but understands its rhythm, and nudges you towards days that balance getting things done with doing things you love.

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite (PWA) |
| Backend | Python, FastAPI |
| Database | PostgreSQL, SQLModel |
| AI *(planned)* | LLM API, embeddings and retrieval |
| ML *(planned)* | scikit-learn, PyTorch |
| Deployment *(planned)* | Docker, added when it's time to deploy |

---

## Project structure

```
life-assistant/
├── frontend/     # React + TypeScript app (Vite)
└── backend/      # FastAPI app, models and routers
```

---

## Running locally

**Prerequisites:** Node 22.12+, Python 3.11+, PostgreSQL (e.g. Postgres.app on macOS)

**Backend**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install "fastapi[standard]" sqlmodel pytest
python -m fastapi dev main.py --host 0.0.0.0
```
API docs: http://127.0.0.1:8000/docs

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev -- --host
```

Open the **Network** URL Vite prints on your phone (same Wi-Fi) to use it on mobile.

---

---

*A personal project, built one milestone at a time.*
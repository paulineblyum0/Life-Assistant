def make_task(client, **overrides):
    data = {"title": "Buy milk", **overrides}
    res = client.post("/tasks", json=data)
    assert res.status_code == 201
    return res.json()


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_create_task_uses_defaults(client):
    task = make_task(client)
    assert task["id"] is not None
    assert task["title"] == "Buy milk"
    assert task["completed"] is False
    assert task["priority"] == 2
    assert task["due_date"] is None


def test_created_task_can_be_fetched(client):
    task = make_task(client, due_date="2026-11-01", priority=1)
    res = client.get(f"/tasks/{task['id']}")
    assert res.status_code == 200
    assert res.json()["due_date"] == "2026-11-01"
    assert res.json()["priority"] == 1


def test_list_puts_open_tasks_first_then_by_priority(client):
    low = make_task(client, title="low", priority=3)
    high = make_task(client, title="high", priority=1)
    done = make_task(client, title="done", priority=1)
    client.patch(f"/tasks/{done['id']}", json={"completed": True})

    titles = [t["title"] for t in client.get("/tasks").json()]
    assert titles == ["high", "low", "done"]


def test_patch_only_changes_given_fields(client):
    task = make_task(client, title="Original", priority=1, notes="keep me")
    res = client.patch(f"/tasks/{task['id']}", json={"completed": True})
    assert res.status_code == 200
    updated = res.json()
    assert updated["completed"] is True
    assert updated["title"] == "Original"
    assert updated["priority"] == 1
    assert updated["notes"] == "keep me"


def test_patch_can_clear_due_date(client):
    task = make_task(client, due_date="2026-11-01")
    res = client.patch(f"/tasks/{task['id']}", json={"due_date": None})
    assert res.json()["due_date"] is None


def test_delete_task(client):
    task = make_task(client)
    assert client.delete(f"/tasks/{task['id']}").status_code == 204
    assert client.get(f"/tasks/{task['id']}").status_code == 404
    assert client.get("/tasks").json() == []


def test_missing_task_returns_404(client):
    assert client.get("/tasks/999").status_code == 404
    assert client.patch("/tasks/999", json={"completed": True}).status_code == 404
    assert client.delete("/tasks/999").status_code == 404


def test_rejects_invalid_priority(client):
    assert client.post("/tasks", json={"title": "x", "priority": 5}).status_code == 422
    task = make_task(client)
    assert client.patch(f"/tasks/{task['id']}", json={"priority": 0}).status_code == 422


def test_rejects_missing_or_too_long_title(client):
    assert client.post("/tasks", json={}).status_code == 422
    assert client.post("/tasks", json={"title": "x" * 201}).status_code == 422

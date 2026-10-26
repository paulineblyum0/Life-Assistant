def make_activity(client, **overrides):
    data = {"name": "Walk", "category": "physical", "duration_minutes": 30, "energy": 2, **overrides}
    res = client.post("/activities", json=data)
    assert res.status_code == 201
    return res.json()


def names(res):
    return [a["name"] for a in res.json()]


def test_create_and_fetch_activity(client):
    activity = make_activity(client)
    res = client.get(f"/activities/{activity['id']}")
    assert res.status_code == 200
    assert res.json()["name"] == "Walk"
    assert res.json()["category"] == "physical"


def test_list_is_sorted_by_name(client):
    make_activity(client, name="Yoga")
    make_activity(client, name="Baking", category="creative")
    assert names(client.get("/activities")) == ["Baking", "Yoga"]


def test_filter_by_max_minutes(client):
    make_activity(client, name="Short", duration_minutes=15)
    make_activity(client, name="Long", duration_minutes=90)
    assert names(client.get("/activities?max_minutes=30")) == ["Short"]


def test_filter_by_max_energy(client):
    make_activity(client, name="Nap", category="relaxing", energy=1)
    make_activity(client, name="Run", energy=3)
    assert names(client.get("/activities?max_energy=2")) == ["Nap"]


def test_filter_by_category(client):
    make_activity(client, name="Run")
    make_activity(client, name="Paint", category="creative")
    assert names(client.get("/activities?category=creative")) == ["Paint"]


def test_filters_combine(client):
    make_activity(client, name="Quick calm", category="relaxing", duration_minutes=10, energy=1)
    make_activity(client, name="Long calm", category="relaxing", duration_minutes=120, energy=1)
    make_activity(client, name="Quick intense", duration_minutes=10, energy=3)
    assert names(client.get("/activities?max_minutes=30&max_energy=1")) == ["Quick calm"]


def test_update_activity(client):
    activity = make_activity(client)
    res = client.patch(f"/activities/{activity['id']}", json={"duration_minutes": 45})
    assert res.status_code == 200
    assert res.json()["duration_minutes"] == 45
    assert res.json()["name"] == "Walk"


def test_delete_activity(client):
    activity = make_activity(client)
    assert client.delete(f"/activities/{activity['id']}").status_code == 204
    assert client.get(f"/activities/{activity['id']}").status_code == 404


def test_rejects_unknown_category(client):
    res = client.post("/activities", json={"name": "x", "category": "sleeping", "duration_minutes": 30})
    assert res.status_code == 422


def test_rejects_out_of_range_duration(client):
    for minutes in (1, 601):
        res = client.post("/activities", json={"name": "x", "category": "social", "duration_minutes": minutes})
        assert res.status_code == 422

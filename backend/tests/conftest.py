import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from db import get_session
from main import app


@pytest.fixture
def client():
    # Fresh in-memory SQLite DB per test, so tests never touch your real Postgres data
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    def get_test_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = get_test_session
    yield TestClient(app)  # no `with`, so the Postgres startup hook doesn't run
    app.dependency_overrides.clear()

from datetime import date, datetime, timezone
from sqlmodel import SQLModel, Field


class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    notes: str | None = None
    completed: bool = False
    priority: int = 2  # 1 = high, 2 = medium, 3 = low
    due_date: date | None = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
from datetime import date, datetime, timezone
from sqlmodel import SQLModel, Field
from typing import Literal


class TaskBase(SQLModel):
    title: str = Field(max_length=200)
    notes: str | None = None
    completed: bool = False
    priority: int = Field(default=2, ge=1, le=3)  # 1 high, 2 medium, 3 low
    due_date: date | None = None


class Task(TaskBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class TaskCreate(TaskBase):
    pass


class TaskUpdate(SQLModel):
    title: str | None = Field(default=None, max_length=200)
    notes: str | None = None
    completed: bool | None = None
    priority: int | None = Field(default=None, ge=1, le=3)
    due_date: date | None = None


class TaskRead(TaskBase):
    id: int
    created_at: datetime

Category = Literal["physical", "creative", "social", "relaxing", "learning"]


class ActivityBase(SQLModel):
    name: str = Field(max_length=100)
    category: str
    duration_minutes: int = Field(ge=5, le=600)
    energy: int = Field(default=2, ge=1, le=3)  # 1 low, 2 medium, 3 high
    notes: str | None = None


class Activity(ActivityBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class ActivityCreate(ActivityBase):
    category: Category


class ActivityUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=100)
    category: Category | None = None
    duration_minutes: int | None = Field(default=None, ge=5, le=600)
    energy: int | None = Field(default=None, ge=1, le=3)
    notes: str | None = None


class ActivityRead(ActivityBase):
    id: int
    created_at: datetime
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from db import SessionDep
from models import Task, TaskCreate, TaskRead, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskRead, status_code=201)
def create_task(task: TaskCreate, session: SessionDep):
    db_task = Task.model_validate(task)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


@router.get("", response_model=list[TaskRead])
def list_tasks(session: SessionDep):
    query = select(Task).order_by(Task.completed, Task.priority, Task.created_at)
    return session.exec(query).all()


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, session: SessionDep):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, updates: TaskUpdate, session: SessionDep):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.sqlmodel_update(updates.model_dump(exclude_unset=True))
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, session: SessionDep):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
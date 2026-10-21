from fastapi import APIRouter, HTTPException
from sqlmodel import select

from db import SessionDep
from models import Activity, ActivityCreate, ActivityRead, ActivityUpdate

router = APIRouter(prefix="/activities", tags=["activities"])


@router.post("", response_model=ActivityRead, status_code=201)
def create_activity(activity: ActivityCreate, session: SessionDep):
    db_activity = Activity.model_validate(activity)
    session.add(db_activity)
    session.commit()
    session.refresh(db_activity)
    return db_activity


@router.get("", response_model=list[ActivityRead])
def list_activities(
    session: SessionDep,
    max_minutes: int | None = None,
    max_energy: int | None = None,
    category: str | None = None,
):
    query = select(Activity)
    if max_minutes is not None:
        query = query.where(Activity.duration_minutes <= max_minutes)
    if max_energy is not None:
        query = query.where(Activity.energy <= max_energy)
    if category is not None:
        query = query.where(Activity.category == category)
    return session.exec(query.order_by(Activity.name)).all()


@router.get("/{activity_id}", response_model=ActivityRead)
def get_activity(activity_id: int, session: SessionDep):
    activity = session.get(Activity, activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


@router.patch("/{activity_id}", response_model=ActivityRead)
def update_activity(activity_id: int, updates: ActivityUpdate, session: SessionDep):
    activity = session.get(Activity, activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    activity.sqlmodel_update(updates.model_dump(exclude_unset=True))
    session.add(activity)
    session.commit()
    session.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=204)
def delete_activity(activity_id: int, session: SessionDep):
    activity = session.get(Activity, activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    session.delete(activity)
    session.commit()
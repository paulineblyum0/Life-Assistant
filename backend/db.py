import os
from sqlmodel import SQLModel, Session, create_engine

from typing import Annotated
from fastapi import Depends


DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://localhost/life_assistant"
)

engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]
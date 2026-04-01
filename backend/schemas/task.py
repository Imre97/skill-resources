from pydantic import BaseModel
from typing import Optional


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    estimated_hours: float = 8.0
    status: str = "open"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    estimated_hours: Optional[float] = None
    status: Optional[str] = None


class Task(TaskBase):
    id: int
    project_id: int
    created_at: str

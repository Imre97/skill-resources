from pydantic import BaseModel
from typing import Optional

class AssignmentBase(BaseModel):
    developer_id: int
    task_id: int
    start_date: str
    end_date: str
    hours_per_day: float = 8.0
    note: Optional[str] = None

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    hours_per_day: Optional[float] = None
    note: Optional[str] = None

class Assignment(AssignmentBase):
    id: int
    created_at: str

class TaskBase(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    estimated_hours: float = 8.0
    status: str = "open"

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    created_at: str

# --- Leave schemas ---

class LeaveBase(BaseModel):
    developer_id: int
    start_date: str
    end_date: str
    leave_type: str = "vacation"
    note: Optional[str] = None

class LeaveCreate(LeaveBase):
    pass

class LeaveUpdate(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    leave_type: Optional[str] = None
    note: Optional[str] = None

class Leave(LeaveBase):
    id: int

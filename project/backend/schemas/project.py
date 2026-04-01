from pydantic import BaseModel
from typing import Optional

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "draft"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    color: str = "#6366f1"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    color: Optional[str] = None

class Project(ProjectBase):
    id: int
    created_at: str

class SkillRequirementBase(BaseModel):
    skill_id: int
    min_score: int
    weight: float = 1.0

class SkillRequirementCreate(SkillRequirementBase):
    pass

class SkillRequirement(SkillRequirementBase):
    id: int
    project_id: int

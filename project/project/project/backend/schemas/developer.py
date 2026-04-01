from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class DeveloperBase(BaseModel):
    name: str
    email: str
    position: Optional[str] = None
    level: str = "mid"
    avatar_url: Optional[str] = None
    team: Optional[str] = None

class DeveloperCreate(DeveloperBase):
    pass

class DeveloperUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    position: Optional[str] = None
    level: Optional[str] = None
    avatar_url: Optional[str] = None
    team: Optional[str] = None

class Developer(DeveloperBase):
    id: int
    created_at: str
    updated_at: str

class DeveloperSkillEntry(BaseModel):
    skill_id: int
    score: int

class DeveloperSkillUpdate(BaseModel):
    skills: list[DeveloperSkillEntry]

class DeveloperWithSkills(Developer):
    skills: list[dict] = []

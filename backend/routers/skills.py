from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.skill import Skill, SkillCreate, SkillUpdate

router = APIRouter(prefix="/api/skills", tags=["skills"])

@router.get("", response_model=list[Skill])
def list_skills(category: str | None = None):
    with get_db() as conn:
        if category:
            rows = conn.execute("SELECT * FROM skills WHERE category=?", (category,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM skills").fetchall()
        return [dict(r) for r in rows]

@router.post("", response_model=Skill, status_code=201)
def create_skill(body: SkillCreate):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO skills (name, category, description) VALUES (?,?,?)",
            (body.name, body.category, body.description)
        )
        row = conn.execute("SELECT * FROM skills WHERE id=?", (cur.lastrowid,)).fetchone()
        return dict(row)

@router.patch("/{skill_id}", response_model=Skill)
def update_skill(skill_id: int, body: SkillUpdate):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM skills WHERE id=?", (skill_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Skill not found")
        fields = {k: v for k, v in body.model_dump().items() if v is not None}
        if fields:
            sets = ", ".join(f"{k}=?" for k in fields)
            conn.execute(f"UPDATE skills SET {sets} WHERE id=?", [*fields.values(), skill_id])
        row = conn.execute("SELECT * FROM skills WHERE id=?", (skill_id,)).fetchone()
        return dict(row)

@router.delete("/{skill_id}", status_code=204)
def delete_skill(skill_id: int):
    with get_db() as conn:
        affected = conn.execute("DELETE FROM skills WHERE id=?", (skill_id,)).rowcount
        if not affected:
            raise HTTPException(404, "Skill not found")

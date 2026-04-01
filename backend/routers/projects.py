from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.project import Project, ProjectCreate, ProjectUpdate, SkillRequirement, SkillRequirementCreate

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("", response_model=list[Project])
def list_projects(status: str | None = None):
    with get_db() as conn:
        if status:
            rows = conn.execute("SELECT * FROM projects WHERE status=?", (status,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM projects").fetchall()
        return [dict(r) for r in rows]

@router.post("", response_model=Project, status_code=201)
def create_project(body: ProjectCreate):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO projects (name, description, status, start_date, end_date, color) VALUES (?,?,?,?,?,?)",
            (body.name, body.description, body.status, body.start_date, body.end_date, body.color)
        )
        row = conn.execute("SELECT * FROM projects WHERE id=?", (cur.lastrowid,)).fetchone()
        return dict(row)

@router.get("/{project_id}", response_model=Project)
def get_project(project_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Project not found")
        return dict(row)

@router.patch("/{project_id}", response_model=Project)
def update_project(project_id: int, body: ProjectUpdate):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Project not found")
        fields = {k: v for k, v in body.model_dump().items() if v is not None}
        if fields:
            sets = ", ".join(f"{k}=?" for k in fields)
            conn.execute(f"UPDATE projects SET {sets} WHERE id=?", [*fields.values(), project_id])
        row = conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        return dict(row)

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int):
    with get_db() as conn:
        affected = conn.execute("DELETE FROM projects WHERE id=?", (project_id,)).rowcount
        if not affected:
            raise HTTPException(404, "Project not found")

@router.get("/{project_id}/requirements", response_model=list[SkillRequirement])
def get_requirements(project_id: int):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM project_skill_requirements WHERE project_id=?", (project_id,)
        ).fetchall()
        return [dict(r) for r in rows]

@router.put("/{project_id}/requirements", response_model=list[SkillRequirement])
def upsert_requirements(project_id: int, body: list[SkillRequirementCreate]):
    with get_db() as conn:
        row = conn.execute("SELECT id FROM projects WHERE id=?", (project_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Project not found")
        conn.execute("DELETE FROM project_skill_requirements WHERE project_id=?", (project_id,))
        for req in body:
            conn.execute(
                "INSERT INTO project_skill_requirements (project_id, skill_id, min_score, weight) VALUES (?,?,?,?)",
                (project_id, req.skill_id, req.min_score, req.weight)
            )
        rows = conn.execute(
            "SELECT * FROM project_skill_requirements WHERE project_id=?", (project_id,)
        ).fetchall()
        return [dict(r) for r in rows]

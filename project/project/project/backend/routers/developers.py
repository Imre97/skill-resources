from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.developer import Developer, DeveloperCreate, DeveloperUpdate, DeveloperWithSkills, DeveloperSkillUpdate

router = APIRouter(prefix="/api/developers", tags=["developers"])

@router.get("", response_model=list[Developer])
def list_developers(team: str | None = None, skill_id: int | None = None, min_score: int | None = None):
    with get_db() as conn:
        query = "SELECT * FROM developers WHERE 1=1"
        params: list = []
        if team:
            query += " AND team = ?"
            params.append(team)
        if skill_id and min_score:
            query += """ AND id IN (
                SELECT developer_id FROM developer_skills
                WHERE skill_id = ? AND score >= ?
            )"""
            params.extend([skill_id, min_score])
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]

@router.post("", response_model=Developer, status_code=201)
def create_developer(body: DeveloperCreate):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO developers (name, email, position, level, avatar_url, team) VALUES (?,?,?,?,?,?)",
            (body.name, body.email, body.position, body.level, body.avatar_url, body.team)
        )
        row = conn.execute("SELECT * FROM developers WHERE id=?", (cur.lastrowid,)).fetchone()
        return dict(row)

@router.get("/{dev_id}", response_model=DeveloperWithSkills)
def get_developer(dev_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM developers WHERE id=?", (dev_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Developer not found")
        dev = dict(row)
        skills = conn.execute("""
            SELECT ds.skill_id, ds.score, s.name, s.category
            FROM developer_skills ds JOIN skills s ON ds.skill_id = s.id
            WHERE ds.developer_id = ?
        """, (dev_id,)).fetchall()
        dev["skills"] = [dict(s) for s in skills]
        return dev

@router.patch("/{dev_id}", response_model=Developer)
def update_developer(dev_id: int, body: DeveloperUpdate):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM developers WHERE id=?", (dev_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Developer not found")
        fields = {k: v for k, v in body.model_dump().items() if v is not None}
        if fields:
            sets = ", ".join(f"{k}=?" for k in fields)
            conn.execute(f"UPDATE developers SET {sets}, updated_at=datetime('now') WHERE id=?",
                         [*fields.values(), dev_id])
        row = conn.execute("SELECT * FROM developers WHERE id=?", (dev_id,)).fetchone()
        return dict(row)

@router.delete("/{dev_id}", status_code=204)
def delete_developer(dev_id: int):
    with get_db() as conn:
        affected = conn.execute("DELETE FROM developers WHERE id=?", (dev_id,)).rowcount
        if not affected:
            raise HTTPException(404, "Developer not found")

@router.put("/{dev_id}/skills", status_code=200)
def upsert_skills(dev_id: int, body: DeveloperSkillUpdate):
    with get_db() as conn:
        row = conn.execute("SELECT id FROM developers WHERE id=?", (dev_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Developer not found")
        for entry in body.skills:
            conn.execute("""
                INSERT INTO developer_skills (developer_id, skill_id, score)
                VALUES (?, ?, ?)
                ON CONFLICT(developer_id, skill_id) DO UPDATE SET score=excluded.score, last_reviewed=datetime('now')
            """, (dev_id, entry.skill_id, entry.score))
    return {"ok": True}

from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.assignment import Assignment, AssignmentCreate, AssignmentUpdate

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


@router.get("", response_model=list[Assignment])
def list_assignments(
    developer_id: int | None = None,
    project_id: int | None = None,
    from_date: str | None = None,
    to_date: str | None = None,
):
    with get_db() as conn:
        query = """
            SELECT a.* FROM assignments a
            JOIN tasks t ON a.task_id = t.id
            WHERE 1=1
        """
        params: list = []
        if developer_id is not None:
            query += " AND a.developer_id = ?"
            params.append(developer_id)
        if project_id is not None:
            query += " AND t.project_id = ?"
            params.append(project_id)
        if from_date:
            query += " AND a.end_date >= ?"
            params.append(from_date)
        if to_date:
            query += " AND a.start_date <= ?"
            params.append(to_date)
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


@router.post("", response_model=Assignment, status_code=201)
def create_assignment(body: AssignmentCreate):
    with get_db() as conn:
        # Overload check: calculate existing daily hours for the developer in the date range
        existing = conn.execute(
            """
            SELECT hours_per_day, start_date, end_date FROM assignments
            WHERE developer_id = ? AND end_date >= ? AND start_date <= ?
            """,
            (body.developer_id, body.start_date, body.end_date),
        ).fetchall()

        # Check for task duplicate
        dup = conn.execute(
            "SELECT id FROM assignments WHERE developer_id = ? AND task_id = ?",
            (body.developer_id, body.task_id),
        ).fetchone()
        if dup:
            raise HTTPException(status_code=409, detail="Ez a fejlesztő már hozzá van rendelve ehhez a feladathoz")

        cur = conn.execute(
            """
            INSERT INTO assignments (developer_id, task_id, start_date, end_date, hours_per_day, note)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (body.developer_id, body.task_id, body.start_date, body.end_date, body.hours_per_day, body.note),
        )
        row = conn.execute("SELECT * FROM assignments WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)


@router.patch("/{assignment_id}", response_model=Assignment)
def update_assignment(assignment_id: int, body: AssignmentUpdate):
    with get_db() as conn:
        existing = conn.execute(
            "SELECT * FROM assignments WHERE id = ?", (assignment_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Assignment nem található")

        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        if not updates:
            return dict(existing)

        fields = ", ".join(f"{k} = ?" for k in updates)
        conn.execute(
            f"UPDATE assignments SET {fields} WHERE id = ?",
            [*updates.values(), assignment_id],
        )
        row = conn.execute("SELECT * FROM assignments WHERE id = ?", (assignment_id,)).fetchone()
        return dict(row)


@router.delete("/{assignment_id}", status_code=204)
def delete_assignment(assignment_id: int):
    with get_db() as conn:
        existing = conn.execute(
            "SELECT id FROM assignments WHERE id = ?", (assignment_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Assignment nem található")
        conn.execute("DELETE FROM assignments WHERE id = ?", (assignment_id,))

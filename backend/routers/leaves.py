from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.assignment import Leave, LeaveCreate, LeaveUpdate

router = APIRouter(prefix="/api/leaves", tags=["leaves"])


@router.get("", response_model=list[Leave])
def list_leaves(
    developer_id: int | None = None,
    from_date: str | None = None,
    to_date: str | None = None,
):
    with get_db() as conn:
        query = "SELECT * FROM leaves WHERE 1=1"
        params: list = []
        if developer_id is not None:
            query += " AND developer_id = ?"
            params.append(developer_id)
        if from_date:
            query += " AND end_date >= ?"
            params.append(from_date)
        if to_date:
            query += " AND start_date <= ?"
            params.append(to_date)
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


@router.post("", response_model=Leave, status_code=201)
def create_leave(body: LeaveCreate):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO leaves (developer_id, start_date, end_date, leave_type, note) VALUES (?,?,?,?,?)",
            (body.developer_id, body.start_date, body.end_date, body.leave_type, body.note),
        )
        row = conn.execute("SELECT * FROM leaves WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)


@router.patch("/{leave_id}", response_model=Leave)
def update_leave(leave_id: int, body: LeaveUpdate):
    with get_db() as conn:
        existing = conn.execute("SELECT * FROM leaves WHERE id = ?", (leave_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Szabadság nem található")

        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        if not updates:
            return dict(existing)

        fields = ", ".join(f"{k} = ?" for k in updates)
        conn.execute(
            f"UPDATE leaves SET {fields} WHERE id = ?",
            [*updates.values(), leave_id],
        )
        row = conn.execute("SELECT * FROM leaves WHERE id = ?", (leave_id,)).fetchone()
        return dict(row)


@router.delete("/{leave_id}", status_code=204)
def delete_leave(leave_id: int):
    with get_db() as conn:
        existing = conn.execute("SELECT id FROM leaves WHERE id = ?", (leave_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Szabadság nem található")
        conn.execute("DELETE FROM leaves WHERE id = ?", (leave_id,))

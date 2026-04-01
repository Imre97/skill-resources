from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.task import Task, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Task not found")
        return dict(row)


@router.patch("/{task_id}", response_model=Task)
def update_task(task_id: int, body: TaskUpdate):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Task not found")
        fields = {k: v for k, v in body.model_dump().items() if v is not None}
        if fields:
            sets = ", ".join(f"{k}=?" for k in fields)
            conn.execute(f"UPDATE tasks SET {sets} WHERE id=?", [*fields.values(), task_id])
        row = conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
        return dict(row)


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int):
    with get_db() as conn:
        affected = conn.execute("DELETE FROM tasks WHERE id=?", (task_id,)).rowcount
        if not affected:
            raise HTTPException(404, "Task not found")

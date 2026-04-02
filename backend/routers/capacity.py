from fastapi import APIRouter
from database import get_db
from datetime import date, timedelta

router = APIRouter(prefix="/api/capacity", tags=["capacity"])


def _date_range(start: str, end: str):
    """Yield each date (as string) between start and end inclusive."""
    d = date.fromisoformat(start)
    end_d = date.fromisoformat(end)
    while d <= end_d:
        yield d.isoformat()
        d += timedelta(days=1)


def _build_daily_map(assignments: list[dict], from_date: str, to_date: str) -> dict[str, dict[int, float]]:
    """Returns {date_str: {developer_id: total_hours}}."""
    result: dict[str, dict[int, float]] = {}
    for a in assignments:
        # Clamp to query range
        start = max(a["start_date"], from_date)
        end = min(a["end_date"], to_date)
        for day in _date_range(start, end):
            result.setdefault(day, {})
            dev_id = a["developer_id"]
            result[day][dev_id] = result[day].get(dev_id, 0.0) + a["hours_per_day"]
    return result


@router.get("")
def get_capacity(from_date: str, to_date: str):
    """Team-level daily capacity overview for a date range."""
    with get_db() as conn:
        assignments = [
            dict(r)
            for r in conn.execute(
                "SELECT developer_id, start_date, end_date, hours_per_day FROM assignments WHERE end_date >= ? AND start_date <= ?",
                (from_date, to_date),
            ).fetchall()
        ]
        developers = [dict(r) for r in conn.execute("SELECT id, name FROM developers").fetchall()]

    daily_map = _build_daily_map(assignments, from_date, to_date)
    dev_map = {d["id"]: d["name"] for d in developers}

    # Build a list of {date, developers: [{id, name, hours}]}
    result = []
    for day in _date_range(from_date, to_date):
        day_devs = daily_map.get(day, {})
        result.append(
            {
                "date": day,
                "developers": [
                    {"developer_id": dev_id, "name": dev_map.get(dev_id, "?"), "hours": hours}
                    for dev_id, hours in day_devs.items()
                ],
                "total_hours": sum(day_devs.values()),
            }
        )
    return result


@router.get("/overloaded")
def get_overloaded(from_date: str, to_date: str, threshold: float = 8.0):
    """Returns developers who exceed the daily hour threshold in the date range."""
    with get_db() as conn:
        assignments = [
            dict(r)
            for r in conn.execute(
                "SELECT developer_id, start_date, end_date, hours_per_day FROM assignments WHERE end_date >= ? AND start_date <= ?",
                (from_date, to_date),
            ).fetchall()
        ]
        developers = [dict(r) for r in conn.execute("SELECT id, name FROM developers").fetchall()]

    daily_map = _build_daily_map(assignments, from_date, to_date)
    dev_map = {d["id"]: d["name"] for d in developers}

    overloaded: dict[int, list[dict]] = {}
    for day, devs in daily_map.items():
        for dev_id, hours in devs.items():
            if hours > threshold:
                overloaded.setdefault(dev_id, [])
                overloaded[dev_id].append({"date": day, "hours": hours})

    return [
        {
            "developer_id": dev_id,
            "name": dev_map.get(dev_id, "?"),
            "overloaded_days": days,
            "max_hours": max(d["hours"] for d in days),
        }
        for dev_id, days in overloaded.items()
    ]

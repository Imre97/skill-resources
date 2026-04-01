import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.environ.get("DB_PATH", "/data/app.db")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_db() as conn:
        conn.executescript("""
            PRAGMA journal_mode=WAL;

            CREATE TABLE IF NOT EXISTS developers (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT    NOT NULL,
                email       TEXT    UNIQUE NOT NULL,
                position    TEXT,
                level       TEXT    CHECK(level IN ('junior','mid','senior')) NOT NULL DEFAULT 'mid',
                avatar_url  TEXT,
                team        TEXT,
                created_at  TEXT    DEFAULT (datetime('now')),
                updated_at  TEXT    DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS skills (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT    NOT NULL UNIQUE,
                category    TEXT    NOT NULL,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS developer_skills (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                developer_id    INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
                skill_id        INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
                score           INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
                last_reviewed   TEXT    DEFAULT (datetime('now')),
                UNIQUE(developer_id, skill_id)
            );

            CREATE TABLE IF NOT EXISTS projects (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT    NOT NULL,
                description TEXT,
                status      TEXT    CHECK(status IN ('draft','active','on_hold','completed')) DEFAULT 'draft',
                start_date  TEXT,
                end_date    TEXT,
                color       TEXT    DEFAULT '#6366f1',
                created_at  TEXT    DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS project_skill_requirements (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                skill_id    INTEGER NOT NULL REFERENCES skills(id),
                min_score   INTEGER NOT NULL CHECK(min_score BETWEEN 1 AND 5),
                weight      REAL    NOT NULL DEFAULT 1.0 CHECK(weight BETWEEN 0.1 AND 3.0),
                UNIQUE(project_id, skill_id)
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                title           TEXT    NOT NULL,
                description     TEXT,
                estimated_hours REAL    NOT NULL DEFAULT 8.0,
                status          TEXT    CHECK(status IN ('open','in_progress','done')) DEFAULT 'open',
                created_at      TEXT    DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS assignments (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                developer_id    INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
                task_id         INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                start_date      TEXT    NOT NULL,
                end_date        TEXT    NOT NULL,
                hours_per_day   REAL    NOT NULL DEFAULT 8.0,
                note            TEXT,
                created_at      TEXT    DEFAULT (datetime('now')),
                UNIQUE(developer_id, task_id)
            );

            CREATE TABLE IF NOT EXISTS leaves (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                developer_id    INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
                start_date      TEXT    NOT NULL,
                end_date        TEXT    NOT NULL,
                leave_type      TEXT    CHECK(leave_type IN ('vacation','sick','other')) DEFAULT 'vacation',
                note            TEXT
            );
        """)

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

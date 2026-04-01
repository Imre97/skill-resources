"""
Seed script: python seed.py
Feltölti az adatbázist alap adatokkal fejlesztéshez.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db, get_db

def seed():
    init_db()
    with get_db() as conn:
        # Skills
        skills = [
            ("React", "frontend", "React.js könyvtár"),
            ("TypeScript", "frontend", "Típusos JavaScript"),
            ("CSS / Tailwind", "frontend", "Stílus és UI"),
            ("Node.js", "backend", "Server-side JavaScript"),
            ("Python", "backend", "Python programozás"),
            ("FastAPI", "backend", "Python web framework"),
            ("PostgreSQL", "backend", "Relációs adatbázis"),
            ("Docker", "devops", "Konténerizáció"),
            ("AWS", "devops", "Amazon felhőszolgáltatások"),
            ("CI/CD", "devops", "Folyamatos integráció"),
            ("Kommunikáció", "soft", "Csapatmunka és kommunikáció"),
            ("Problem Solving", "soft", "Problémamegoldás"),
        ]
        for name, cat, desc in skills:
            conn.execute(
                "INSERT OR IGNORE INTO skills (name, category, description) VALUES (?,?,?)",
                (name, cat, desc)
            )

        # Developers
        developers = [
            ("Kovács Anna", "anna@nexus.dev", "Senior Frontend Developer", "senior", "Alpha"),
            ("Nagy Péter", "peter@nexus.dev", "Backend Engineer", "mid", "Beta"),
            ("Szabó Réka", "reka@nexus.dev", "Full Stack Developer", "senior", "Alpha"),
            ("Tóth Bence", "bence@nexus.dev", "Junior Frontend Developer", "junior", "Beta"),
            ("Fekete Dóra", "dora@nexus.dev", "DevOps Engineer", "mid", "Ops"),
        ]
        dev_ids = []
        for name, email, pos, level, team in developers:
            cur = conn.execute(
                "INSERT OR IGNORE INTO developers (name, email, position, level, team) VALUES (?,?,?,?,?)",
                (name, email, pos, level, team)
            )
            row = conn.execute("SELECT id FROM developers WHERE email=?", (email,)).fetchone()
            dev_ids.append(row["id"])

        # Developer skills
        skill_ids = {row["name"]: row["id"] for row in conn.execute("SELECT id, name FROM skills").fetchall()}

        dev_skills = [
            # Anna – senior frontend
            (dev_ids[0], [("React", 5), ("TypeScript", 5), ("CSS / Tailwind", 4), ("Kommunikáció", 4)]),
            # Péter – backend
            (dev_ids[1], [("Python", 4), ("FastAPI", 4), ("PostgreSQL", 3), ("Docker", 3)]),
            # Réka – full stack
            (dev_ids[2], [("React", 4), ("TypeScript", 4), ("Python", 4), ("FastAPI", 3), ("PostgreSQL", 4)]),
            # Bence – junior frontend
            (dev_ids[3], [("React", 3), ("TypeScript", 2), ("CSS / Tailwind", 3)]),
            # Dóra – devops
            (dev_ids[4], [("Docker", 5), ("AWS", 4), ("CI/CD", 5), ("Python", 3)]),
        ]
        for dev_id, skills_list in dev_skills:
            for skill_name, score in skills_list:
                sid = skill_ids.get(skill_name)
                if sid:
                    conn.execute("""
                        INSERT OR REPLACE INTO developer_skills (developer_id, skill_id, score)
                        VALUES (?,?,?)
                    """, (dev_id, sid, score))

        # Projects
        projects = [
            ("Banki App", "Mobil banki alkalmazás fejlesztése", "active", "2026-03-01", "2026-07-31", "#6366f1"),
            ("DevOps Platform", "Belső CI/CD platform kiépítése", "active", "2026-02-15", "2026-06-30", "#10b981"),
            ("E-Commerce Rewrite", "Legacy rendszer React migrációja", "draft", "2026-05-01", "2026-10-31", "#f59e0b"),
        ]
        for name, desc, status, start, end, color in projects:
            conn.execute(
                "INSERT OR IGNORE INTO projects (name, description, status, start_date, end_date, color) VALUES (?,?,?,?,?,?)",
                (name, desc, status, start, end, color)
            )

    print("Seed kész!")

if __name__ == "__main__":
    seed()

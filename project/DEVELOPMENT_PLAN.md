# Nexus Skill & Resource Planner – Részletes Fejlesztési Terv

> Utolsó frissítés: 2026-04-01
> Tech stack: React 19 + TypeScript + Vite + Shadcn/ui + Zustand + dnd-kit | FastAPI + SQLite3 | Docker

---

## Tartalomjegyzék

1. [Piackutatás – Mire tanítanak a meglévő eszközök?](#1-piackutatás)
2. [Teljes Feature Lista (MVP + jövő)](#2-teljes-feature-lista)
3. [Adatmodell](#3-adatmodell)
4. [Frontend architektúra](#4-frontend-architektúra)
5. [Backend API tervezés](#5-backend-api-tervezés)
6. [Könyvtár-választás és indoklás](#6-könyvtár-választás-és-indoklás)
7. [Fejlesztési fázisok és prioritás](#7-fejlesztési-fázisok-és-prioritás)
8. [Technikai kihívások és megoldási javaslatok](#8-technikai-kihívások-és-megoldási-javaslatok)

---

## 1. Piackutatás

### Elemzett eszközök és kulcs-tanulságok

#### Float (float.com)
- **Erősség:** Tiszta, minimalista UI; on-schedule capacity indicator azonnal mutatja a túlterheltséget; color-coding projektenként; drag-and-drop scheduler az idővonalban.
- **Gyengeség:** Time tracking nehezen használható; UX helyenként elavult.
- **Tanulság a tervezéshez:** A kapacitás-jelző (szabad/foglalt/túlterhelt) legyen azonnal látható a scheduler fejlécében; a color-coding projektenként segít az átláthatóságban.

#### Resource Guru (resourceguruapp.com)
- **Erősség:** Intuitív drag-and-drop scheduler; clash management (ütközés-detektálás foglalasnál); "leave management" integrálva; waiting list funkció.
- **Gyengeség:** Kevés reporting funkció az alapcsomagban.
- **Tanulság a tervezéshez:** Az ütközésjelzés (overload warning) ne csak passzív legyen – aktívan kérdezzen rá, ha valaki elé >8h/nap kerülne.

#### Teamdeck (teamdeck.io)
- **Erősség:** Szabadság-kezelés integrálva a schedulerbe; resource availability view; idő-riportok.
- **Gyengeség:** Nehézkes UX, meredek tanulási görbe.
- **Tanulság a tervezéshez:** Az availability és leave megjelenítése az idővonalban szükséges; az UX egyszerűségére kell törekedni.

#### Skills Base (skills-base.com)
- **Erősség:** Vizuális kompetencia-térkép; önértékelés + vezető értékelés kettős mód; gap analysis; szűrhető mátrix.
- **Gyengeség:** Nincs beépített resource scheduling; LMS integráció nélkül nincs fejlesztési terv.
- **Tanulság a tervezéshez:** Az 1–5 pontozásos skill mátrix mellett gap analysis is kell (projekt-követelmény vs. developer képesség).

#### Bevált UX minták (iparági standard)
| Minta | Leírás | Alkalmazás a Nexusban |
|---|---|---|
| Color-coded timeline | Projektek/fejlesztők szín szerint | Scheduler sorok |
| Capacity bar | % vagy h/nap kihasználtság | Scheduler fejléc, Developer kártyán |
| Overload highlight | Piros kiemelés >100% kapacitásnál | dnd-kit drop feedback |
| Skill radar overlay | Több fejlesztő összehasonlítása egy charton | Team simulator |
| Match score badge | % egyezés a projekt-követelményekkel | Ajánlás listán |
| Availability strip | Szabadság/betegség sávok az idővonalban | Scheduler sorok |

---

## 2. Teljes Feature Lista

### A. Interaktív Skill Matrix (MVP)
- Fejlesztői profil CRUD (név, pozíció, senior/mid/junior szint, avatar)
- Skill-ek kezelése kategóriánként (Frontend, Backend, DevOps, Soft Skills)
- 1–5 pontozás skillenként; pontszám-magyarázat tooltip-ben (1=alapszint, 5=szakértő)
- Radar/Spider chart vizualizáció fejlesztőnként
- Többes kiválasztás: több fejlesztő összehasonlítása egy charton (overlay)
- Szűrők: skill típus, minimum pontszám, részleg/csapat
- Skill gap elemzés: projekt-követelmény vs. developer profil (opcionális MVP+)

### B. Drag-and-Drop Resource Scheduler (MVP)
- Gantt-szerű heti/kéthetes/havi nézet az idővonalban
- Fejlesztők soronként, projektek/feladatok húzható blokkok
- Drag-and-drop: blokk áthelyezése, nyújtása (hosszabbítás/rövidítés)
- Overload warning: piros highlight ha >8h/nap; confirm dialog before drop
- Kapacitás-sáv: minden sorban napi h-összesítő, vizuális sávként
- Szabadság/betegszabadság jelölés az idővonalban (szürke sáv)
- Konfliktus-detektálás: átfedő foglalások jelzése

### C. Csapat-összeállítási Szimulátor (MVP)
- Projekt kiválasztása / új projekt létrehozása skillkövetelményekkel
- Match Score algoritmus: projekt-követelmény vs. developer skill súlyozott összehasonlítása
- Top-N ajánlott fejlesztő listája match % megjelenítéssel
- Csapat összeállítása drag-and-drop vagy kattintásos hozzáadással
- Simulate gomb: a kiválasztott csapat várható kapacitás-kihasználtsága
- Gap visualization: hiányzó skillekhez tanulási javaslat placeholder

### D. Dashboard (MVP+)
- Összesített nézet: aktív projektek száma, kihasználtság %, nyitott pozíciók
- Overload alert panel: ki van túlterhelve és mikor
- Közelgő deadline-ok widget
- Csapat kapacitás trendvonal (heti/havi aggregálva)
- Skill distribution donut chart (mi a csapat erőssége/gyengesége)

### E. Projekt- és feladat-kezelés (MVP)
- Projekt CRUD: név, leírás, kezdő/befejező dátum, státusz, szükséges skill-ek és szintek
- Task CRUD projekten belül: cím, becsült óra, hozzárendelt fejlesztő, státusz
- Projekt státuszok: Draft / Active / On Hold / Completed

### F. Értesítések (MVP+)
- In-app notification center (Shadcn Toast + notification drawer)
- Trigger esemény: overload figyelmeztetés foglaláskor
- Trigger esemény: projekt deadline közeledik (3 nappal előtte)
- Trigger esemény: skill gap azonosítva új projekthez
- (Jövő) E-mail digest integráció

### G. Export (MVP+)
- Skill Matrix exportálása CSV-be
- Scheduler nézet exportálása PNG-be (html2canvas vagy Puppeteer)
- Projekt hozzárendelés-riport exportálása PDF-be
- (Jövő) Excel (.xlsx) export openpyxl-lel backenden

### H. Role-Based Access Control (MVP+)
- Szerepkörök: `admin`, `manager`, `developer`
- `admin`: mindent lát és módosíthat
- `manager`: projekteket és assignmenteket kezel; developereket nem törölhet
- `developer`: csak a saját profilt és skilljeit szerkesztheti; mások profilját olvashatja
- JWT-alapú autentikáció (python-jose backenden, localStorage/cookie frontendon)
- Route guard React Router-rel

### I. Egyéb jövőbeli funkciók (Backlog)
- Skill önértékelés: fejlesztő maga kéri a skill pontszám felülvizsgálatát
- Peer review: kolléga értékeli a skill pontszámot
- Integrációk: Jira, GitHub activity import skill pontszámhoz
- AI-alapú skill-ajánlás (ha ismert projektek alapján hiányzó skill-ek azonosíthatók)
- Kapacitás-tervező naptár szinkron (Google Calendar, Outlook)
- Multi-tenant (több cég, SaaS mód)

---

## 3. Adatmodell

### Entitások és kapcsolataik

```
Developer ─────────────── DeveloperSkill ──────────── Skill
    │                          (pivot)                   │
    │                    developer_id (FK)           id, name
    │                    skill_id (FK)               category
    │                    score (1–5)                 description
    │
    ├──── Assignment ──────────── Task
    │     developer_id (FK)       id, title
    │     task_id (FK)            project_id (FK)
    │     start_date              estimated_hours
    │     end_date                status
    │     hours_per_day           assigned_developer_id (FK, nullable)
    │
    └──── User (1:1)
          id, email, role

Project ──── Task (1:N)
    │         ProjectSkillRequirement (1:N)
    │              project_id (FK)
    │              skill_id (FK)
    │              min_score (1–5)
    │              weight (0.0–1.0)
    │
    └── Leave (fejlesztői szabadság, N:1 Developer)
         developer_id (FK)
         start_date
         end_date
         leave_type (vacation/sick/other)
```

### Táblák részletesen (SQLite DDL)

```sql
-- Fejlesztők
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

-- Skill-ek (kategorizálva)
CREATE TABLE IF NOT EXISTS skills (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    category    TEXT    NOT NULL,  -- 'frontend','backend','devops','soft','other'
    description TEXT
);

-- Fejlesztő ↔ Skill pontszám (pivot)
CREATE TABLE IF NOT EXISTS developer_skills (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    developer_id    INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    skill_id        INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    score           INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
    last_reviewed   TEXT    DEFAULT (datetime('now')),
    UNIQUE(developer_id, skill_id)
);

-- Projektek
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

-- Projekt skill-követelmények
CREATE TABLE IF NOT EXISTS project_skill_requirements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id    INTEGER NOT NULL REFERENCES skills(id),
    min_score   INTEGER NOT NULL CHECK(min_score BETWEEN 1 AND 5),
    weight      REAL    NOT NULL DEFAULT 1.0 CHECK(weight BETWEEN 0.1 AND 3.0),
    UNIQUE(project_id, skill_id)
);

-- Feladatok
CREATE TABLE IF NOT EXISTS tasks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           TEXT    NOT NULL,
    description     TEXT,
    estimated_hours REAL    NOT NULL DEFAULT 8.0,
    status          TEXT    CHECK(status IN ('open','in_progress','done')) DEFAULT 'open',
    created_at      TEXT    DEFAULT (datetime('now'))
);

-- Hozzárendelések (ki dolgozik mikor min)
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

-- Szabadság / távollét
CREATE TABLE IF NOT EXISTS leaves (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    developer_id    INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    start_date      TEXT    NOT NULL,
    end_date        TEXT    NOT NULL,
    leave_type      TEXT    CHECK(leave_type IN ('vacation','sick','other')) DEFAULT 'vacation',
    note            TEXT
);

-- Felhasználók (autentikáció)
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT    UNIQUE NOT NULL,
    hashed_password TEXT    NOT NULL,
    role            TEXT    CHECK(role IN ('admin','manager','developer')) DEFAULT 'developer',
    developer_id    INTEGER REFERENCES developers(id),
    created_at      TEXT    DEFAULT (datetime('now'))
);
```

---

## 4. Frontend Architektúra

### Route-ok (React Router v7)

```
/                           → redirect → /dashboard
/dashboard                  → DashboardPage
/skills                     → SkillMatrixPage
/skills/:developerId        → DeveloperProfilePage
/scheduler                  → SchedulerPage
/scheduler/:projectId       → SchedulerPage (projekt szűrve)
/simulator                  → TeamSimulatorPage
/simulator/:projectId       → TeamSimulatorPage (projekt előre töltve)
/projects                   → ProjectsPage
/projects/:projectId        → ProjectDetailPage
/developers                 → DevelopersPage
/developers/:developerId    → DeveloperProfilePage
/settings                   → SettingsPage
/login                      → LoginPage
```

### Oldalstruktúra és fő komponensek feature-enként

#### A. Skill Matrix (`/skills`)

```
src/
├── pages/
│   └── SkillMatrixPage.tsx          ← route wrapper, layout
├── components/
│   └── skills/
│       ├── SkillMatrixTable.tsx      ← fejlesztők × skill-ek táblázat
│       ├── SkillRadarChart.tsx       ← recharts RadarChart wrapper
│       ├── SkillRadarOverlay.tsx     ← több fejlesztő összehasonlítása
│       ├── DeveloperSkillCard.tsx    ← profil kártya skill badge-ekkel
│       ├── SkillScoreBadge.tsx       ← 1–5 pontozás vizuális jelölője
│       ├── SkillFilterBar.tsx        ← kategória/minimum szint szűrők
│       └── SkillEditForm.tsx         ← pontszám szerkesztés (inline vagy modal)
├── hooks/
│   ├── useSkillMatrix.ts             ← fejlesztők + skill-ek fetch, szűrés
│   ├── useSkillRadar.ts              ← radar chart adat-transzformáció
│   └── useSkillEdit.ts               ← PATCH skill score
├── stores/
│   └── skillStore.ts                 ← developers[], skills[], filters
└── schemas/
    └── skillSchema.ts                ← Zod: DeveloperSkill, SkillFilter
```

#### B. Resource Scheduler (`/scheduler`)

```
src/
├── pages/
│   └── SchedulerPage.tsx
├── components/
│   └── scheduler/
│       ├── SchedulerTimeline.tsx     ← fő idővonal konténer (dnd-timeline)
│       ├── SchedulerRow.tsx          ← egy fejlesztő sora
│       ├── AssignmentBlock.tsx       ← húzható/nyújtható feladat-blokk
│       ├── CapacityBar.tsx           ← napi h összesítő sáv
│       ├── LeaveStrip.tsx            ← szabadság sáv
│       ├── OverloadWarningDialog.tsx ← confirm dialog >8h esetén
│       ├── TimeAxisHeader.tsx        ← dátum fejléc (nap/hét/hónap)
│       └── SchedulerToolbar.tsx      ← nézet váltó, zoom, szűrők
├── hooks/
│   ├── useScheduler.ts               ← assignments, leaves fetch
│   ├── useAssignmentDrag.ts          ← dnd-kit drag logika, ütközés-check
│   ├── useCapacityCalc.ts            ← napi/heti óra összesítés, overload detect
│   └── useSchedulerView.ts           ← aktív nézet (week/month), dátum ablak
├── stores/
│   └── schedulerStore.ts             ← assignments[], leaves[], viewMode, dateRange
└── schemas/
    └── assignmentSchema.ts           ← Zod: Assignment, LeaveEntry
```

#### C. Team Simulator (`/simulator`)

```
src/
├── pages/
│   └── TeamSimulatorPage.tsx
├── components/
│   └── simulator/
│       ├── ProjectRequirementPanel.tsx  ← projekt skill-követelmények szerkesztése
│       ├── DeveloperMatchList.tsx       ← rendezett lista match score-ral
│       ├── DeveloperMatchCard.tsx       ← fejlesztő kártya + % badge + skill gap
│       ├── SelectedTeamPanel.tsx        ← összeállított csapat
│       ├── MatchScoreBar.tsx            ← vizuális % sáv
│       ├── SkillGapBadge.tsx            ← piros badge hiányzó skilleknél
│       └── SimulateCapacityModal.tsx    ← kapacitás-előnézet a csapathoz
├── hooks/
│   ├── useTeamSimulator.ts             ← projekt + developer-ek fetch
│   ├── useMatchScore.ts                ← Match Score kalkuláció (tiszta fn)
│   └── useSimulatorSelection.ts        ← kiválasztott fejlesztők kezelése
├── lib/
│   └── matchScore.ts                   ← TISZTA FÜGGVÉNY: score algoritmus
├── stores/
│   └── simulatorStore.ts               ← selectedProject, selectedDevelopers[]
└── schemas/
    └── simulatorSchema.ts
```

#### D. Dashboard (`/dashboard`)

```
src/
├── pages/
│   └── DashboardPage.tsx
└── components/
    └── dashboard/
        ├── OverloadAlertPanel.tsx      ← túlterhelt fejlesztők listája
        ├── ActiveProjectsWidget.tsx    ← aktív projektek száma + státusz
        ├── CapacityTrendChart.tsx      ← recharts LineChart heti trend
        ├── SkillDistributionChart.tsx  ← recharts PieChart skill kategóriák
        ├── UpcomingDeadlinesWidget.tsx ← közelgő boundary-k
        └── QuickStatsRow.tsx           ← számok kártyákban
```

### Zustand Store-ok (feature-enkénti szétválasztás)

```ts
// src/stores/skillStore.ts
interface SkillStore {
  developers: Developer[];
  skills: Skill[];
  selectedDeveloperIds: number[];
  filters: SkillFilter;
  setDevelopers: (d: Developer[]) => void;
  setSkills: (s: Skill[]) => void;
  toggleDeveloperSelection: (id: number) => void;
  setFilters: (f: Partial<SkillFilter>) => void;
}

// src/stores/schedulerStore.ts
interface SchedulerStore {
  assignments: Assignment[];
  leaves: Leave[];
  viewMode: 'week' | 'two-week' | 'month';
  dateRangeStart: string;        // ISO date
  setAssignments: (a: Assignment[]) => void;
  addAssignment: (a: Assignment) => void;
  updateAssignment: (id: number, patch: Partial<Assignment>) => void;
  deleteAssignment: (id: number) => void;
  setViewMode: (m: SchedulerStore['viewMode']) => void;
}

// src/stores/simulatorStore.ts
interface SimulatorStore {
  activeProjectId: number | null;
  selectedDeveloperIds: number[];
  setProject: (id: number | null) => void;
  toggleDeveloper: (id: number) => void;
  clearSelection: () => void;
}

// src/stores/uiStore.ts
interface UIStore {
  notificationDrawerOpen: boolean;
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  toggleNotificationDrawer: () => void;
}
```

### Globális komponensek

```
src/components/
├── layout/
│   ├── AppShell.tsx          ← sidebar + topbar + main content wrapper
│   ├── Sidebar.tsx           ← navigáció, aktív route kiemelés
│   ├── TopBar.tsx            ← keresés, notification bell, user menu
│   └── NotificationDrawer.tsx ← in-app értesítés panel
├── ui/                       ← Shadcn/ui generált (ne módosítsd)
└── common/
    ├── ConfirmDialog.tsx     ← újrahasználható megerősítő modal
    ├── EmptyState.tsx        ← üres lista állapot
    ├── LoadingSpinner.tsx
    └── ErrorBoundary.tsx
```

---

## 5. Backend API Tervezés

### FastAPI struktúra

```
backend/
├── main.py              ← app init, lifespan, router include
├── database.py          ← SQLite connect, get_db dependency
├── models/              ← SQLAlchemy ORM modellek (vagy SQLModel)
│   ├── developer.py
│   ├── skill.py
│   ├── project.py
│   ├── assignment.py
│   └── user.py
├── schemas/             ← Pydantic request/response modellek
│   ├── developer.py
│   ├── skill.py
│   ├── project.py
│   ├── assignment.py
│   └── auth.py
├── routers/             ← route-ok feature-enként
│   ├── developers.py
│   ├── skills.py
│   ├── projects.py
│   ├── assignments.py
│   ├── leaves.py
│   ├── simulator.py
│   └── auth.py
├── services/            ← üzleti logika (MatchScore, kapacitás-számítás)
│   ├── match_score.py
│   └── capacity.py
├── requirements.txt
└── Dockerfile
```

### API végpontok teljes listája

#### Developers

| Method | Endpoint | Leírás |
|---|---|---|
| `GET` | `/api/developers` | Összes fejlesztő listája (szűrhető: `?team=`, `?skill_id=`, `?min_score=`) |
| `POST` | `/api/developers` | Új fejlesztő létrehozása |
| `GET` | `/api/developers/{id}` | Egy fejlesztő részletei (skill-ekkel együtt) |
| `PATCH` | `/api/developers/{id}` | Fejlesztő alap adatainak frissítése |
| `DELETE` | `/api/developers/{id}` | Fejlesztő törlése |
| `GET` | `/api/developers/{id}/skills` | Fejlesztő skill-listája pontszámokkal |
| `PUT` | `/api/developers/{id}/skills` | Skill pontszámok tömeges frissítése (upsert) |
| `PATCH` | `/api/developers/{id}/skills/{skill_id}` | Egy skill pontszám frissítése |
| `GET` | `/api/developers/{id}/assignments` | Fejlesztő összes hozzárendelése |
| `GET` | `/api/developers/{id}/capacity` | Napi kapacitás összesítő (`?from=&to=`) |

#### Skills

| Method | Endpoint | Leírás |
|---|---|---|
| `GET` | `/api/skills` | Összes skill listája (szűrhető: `?category=`) |
| `POST` | `/api/skills` | Új skill létrehozása |
| `PATCH` | `/api/skills/{id}` | Skill módosítása |
| `DELETE` | `/api/skills/{id}` | Skill törlése (cascade developer_skills) |

#### Projects

| Method | Endpoint | Leírás |
|---|---|---|
| `GET` | `/api/projects` | Összes projekt (szűrhető: `?status=`) |
| `POST` | `/api/projects` | Új projekt |
| `GET` | `/api/projects/{id}` | Projekt részletei (task-okkal, skill-követelményekkel) |
| `PATCH` | `/api/projects/{id}` | Projekt módosítása |
| `DELETE` | `/api/projects/{id}` | Projekt törlése |
| `GET` | `/api/projects/{id}/tasks` | Projekt feladatai |
| `POST` | `/api/projects/{id}/tasks` | Új feladat projekthez |
| `PUT` | `/api/projects/{id}/requirements` | Skill-követelmények tömeges frissítése |

#### Tasks

| Method | Endpoint | Leírás |
|---|---|---|
| `GET` | `/api/tasks/{id}` | Egy feladat részletei |
| `PATCH` | `/api/tasks/{id}` | Feladat módosítása |
| `DELETE` | `/api/tasks/{id}` | Feladat törlése |

#### Assignments

| Method | Endpoint | Leírás |
|---|---|---|
| `GET` | `/api/assignments` | Összes assignment (`?developer_id=`, `?project_id=`, `?from=`, `?to=`) |
| `POST` | `/api/assignments` | Új hozzárendelés (ütközés-ellenőrzéssel) |
| `PATCH` | `/api/assignments/{id}` | Dátum/óra módosítás (drag után) |
| `DELETE` | `/api/assignments/{id}` | Hozzárendelés törlése |

#### Leaves (Szabadság)

| Method | Endpoint | Leírás |
|---|---|---|
| `GET` | `/api/leaves` | Összes szabadság (`?developer_id=`, `?from=`, `?to=`) |
| `POST` | `/api/leaves` | Szabadság rögzítése |
| `PATCH` | `/api/leaves/{id}` | Módosítás |
| `DELETE` | `/api/leaves/{id}` | Törlés |

#### Simulator

| Method | Endpoint | Leírás |
|---|---|---|
| `GET` | `/api/simulator/match?project_id={id}` | Match Score számítás az összes fejlesztőre egy projekthez |
| `POST` | `/api/simulator/match` | Match Score számítás custom követelménylistára (body: skill requirements) |

**Match Score válasz (példa):**
```json
{
  "project_id": 5,
  "scores": [
    {
      "developer_id": 3,
      "developer_name": "Kiss Péter",
      "match_score": 87.5,
      "skill_details": [
        { "skill_id": 1, "skill_name": "React", "required": 4, "actual": 5, "met": true },
        { "skill_id": 2, "skill_name": "TypeScript", "required": 3, "actual": 2, "met": false }
      ],
      "missing_skills": ["TypeScript"],
      "available": true
    }
  ]
}
```

#### Capacity

| Method | Endpoint | Leírás |
|---|---|---|
| `GET` | `/api/capacity?from=&to=` | Csapatszintű kapacitás összesítő dátumtartományra |
| `GET` | `/api/capacity/overloaded?from=&to=` | Túlterhelt fejlesztők listája a dátumtartományban |

#### Auth (RBAC)

| Method | Endpoint | Leírás |
|---|---|---|
| `POST` | `/api/auth/login` | Belépés (email + jelszó → JWT token) |
| `POST` | `/api/auth/refresh` | Token frissítés |
| `GET` | `/api/auth/me` | Saját felhasználói adatok |
| `PATCH` | `/api/auth/me/password` | Jelszóváltoztatás |

#### Export

| Method | Endpoint | Leírás |
|---|---|---|
| `GET` | `/api/export/skill-matrix?format=csv` | Skill mátrix CSV exportálása |
| `GET` | `/api/export/assignments?from=&to=&format=csv` | Hozzárendelések CSV |

---

## 6. Könyvtár-választás és Indoklás

### Radar / Spider Chart – **Recharts** ✅

**Miért Recharts és nem visx vagy Chart.js?**

| Szempont | Recharts | visx (Airbnb) | Chart.js |
|---|---|---|---|
| React integráció | Natív, deklaratív API | Natív, de low-level primitívek | Imperatív, ref-alapú |
| Radar chart támogatás | Beépített `<RadarChart>` + `<Radar>` | Manuálisan építendő D3-mal | Beépített, de React wrapper kell |
| TypeScript | Teljes TS support | Teljes TS support | `chart.js` + `react-chartjs-2` |
| Shadcn/ui integráció | **Shadcn Charts alapkönyvtára** (recharts-ra épül) | Nem integrált | Nem integrált |
| Bundle méret | ~130 kB gzip | ~80 kB (csak amit használsz) | ~60 kB + wrapper |
| Tanulási görbe | Alacsony | Magas | Közép |
| Overlay (több fejlesztő) | Könnyen: több `<Radar>` ugyanabban | Manuális | Könnyen |

**Döntés:** A Shadcn/ui már recharts-ra épített chart primitíveket tartalmaz (`src/components/ui/chart.tsx`). Ezt kell használni – egységes theming, dark mode, és nem kell extra könyvtárat installálni.

```tsx
// Példa: skill radar overlay több fejlesztőre
<RadarChart data={normalizedSkillData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="skill" />
  {selectedDevelopers.map((dev, i) => (
    <Radar
      key={dev.id}
      name={dev.name}
      dataKey={`scores.${dev.id}`}
      stroke={COLORS[i]}
      fill={COLORS[i]}
      fillOpacity={0.15}
    />
  ))}
  <Legend />
</RadarChart>
```

### Timeline / Drag-and-Drop Scheduler – **dnd-timeline** ✅

**Miért dnd-timeline és nem react-big-calendar vagy SVAR Gantt?**

| Szempont | dnd-timeline | react-big-calendar | SVAR React Gantt |
|---|---|---|---|
| dnd-kit alapú | **Igen** (natív integráció) | Nem (saját DnD) | Nem |
| React 19 | Igen | Igen | Igen |
| Headless (saját stílus) | **Igen** | Nem (saját CSS) | Részben |
| Shadcn/ui-val kompatibilis | **Igen** (headless) | Nehézkes override | Nehézkes |
| TypeScript | Teljes | Részleges | Teljes |
| Virtualizáció | Igen | Nem | Igen |
| Bundle méret | Kis (~15kB) | Közepes | Nagy (pro feature-ök) |
| Licensz | MIT | MIT | MIT (alap) |

**Döntés:** `dnd-timeline` (github.com/samuelarbibe/dnd-timeline) — headless, dnd-kit-re épül (amit már használunk), saját stílussal teljesen alakítható, Shadcn komponensekkel kombinálható.

**Telepítés:**
```bash
npm install dnd-timeline
```

**Kulcs hookjai:**
- `useTimeline` — idővonal state kezelés
- `useItem` — húzható blokk regisztrálása
- `useRow` — fejlesztő sor regisztrálása
- `Relevance` — időintervallum modell (start/end millisecond)

### Match Score Algoritmus

**Súlyozott skill-egyezési pontszám** — tiszta TypeScript függvény (`src/lib/matchScore.ts`):

```ts
export interface SkillRequirement {
  skillId: number;
  minScore: number;    // 1–5
  weight: number;      // 0.1–3.0 (fontossági szorzó)
}

export interface DeveloperSkillMap {
  developerId: number;
  scores: Record<number, number>;  // skillId → score
}

export function calculateMatchScore(
  requirements: SkillRequirement[],
  developer: DeveloperSkillMap
): { score: number; details: SkillMatchDetail[] } {
  let totalWeight = 0;
  let weightedScore = 0;

  const details = requirements.map((req) => {
    const actual = developer.scores[req.skillId] ?? 0;
    const met = actual >= req.minScore;
    // Lineáris részleges teljesítés: ha actual=3, min=5 → 60%
    const ratio = met ? 1.0 : actual / req.minScore;
    weightedScore += ratio * req.weight;
    totalWeight += req.weight;
    return { skillId: req.skillId, required: req.minScore, actual, met, ratio };
  });

  const score = totalWeight > 0
    ? Math.round((weightedScore / totalWeight) * 100)
    : 0;

  return { score, details };
}
```

**Backenden (Python):** ugyanez a logika a `/api/simulator/match` endpointon, hogy a sorting és top-N szűrés szerver oldalon történjen nagy csapatnál.

---

## 7. Fejlesztési Fázisok és Prioritás

### Fázis 0 – Projekt alapozás (1–2 nap)

- [ ] Docker Compose ellenőrzés, backend/frontend live reload
- [ ] SQLite táblák és seed adatok (`seed.py`)
- [ ] React Router v7 route struktúra felállítása
- [ ] AppShell layout (Sidebar, TopBar) Shadcn-nel
- [ ] API client wrapper (`src/lib/api.ts`) – fetch + error handling + typed responses
- [ ] Alap Zod sémák: `Developer`, `Skill`, `Project`, `Assignment`

### Fázis 1 – MVP Core (1–2 hét)

**Prioritás: Skill Matrix + Fejlesztői profilok**

- [ ] `GET/POST/PATCH /api/developers` + `GET/PATCH /api/skills`
- [ ] `PUT /api/developers/{id}/skills` – tömeges skill upsert
- [ ] `DevelopersPage` – lista, kártya nézet, keresés/szűrés
- [ ] `DeveloperProfilePage` – profiladatok + skill szerkesztés
- [ ] `SkillMatrixPage` – táblázatos mátrix nézet
- [ ] `SkillRadarChart` – egy fejlesztő radar chartja
- [ ] Shadcn Chart integrálása recharts RadarChart-tal

**Prioritás: Projekt- és task-kezelés**

- [ ] `GET/POST/PATCH/DELETE /api/projects` + task CRUD
- [ ] `GET/PUT /api/projects/{id}/requirements` – skill-követelmények
- [ ] `ProjectsPage` + `ProjectDetailPage`

### Fázis 2 – Scheduler (1–2 hét)

- [ ] `GET/POST/PATCH/DELETE /api/assignments` + `/api/leaves`
- [ ] `GET /api/capacity` + `/api/capacity/overloaded`
- [ ] `dnd-timeline` integráció: `SchedulerTimeline`, `SchedulerRow`, `AssignmentBlock`
- [ ] Drag logika: `useAssignmentDrag` – PATCH assignment dátumok drag után
- [ ] `CapacityBar` + overload detect (`useCapacityCalc`)
- [ ] `OverloadWarningDialog` – confirm before drop >8h
- [ ] `LeaveStrip` – szabadság vizualizáció a sorban
- [ ] Heti/kéthetes/havi nézet váltó

### Fázis 3 – Team Simulator (3–5 nap)

- [ ] `GET /api/simulator/match?project_id=` backend implementáció
- [ ] `matchScore.ts` tiszta függvény + tesztek
- [ ] `TeamSimulatorPage` – projekt választó + ajánlott fejlesztők
- [ ] `DeveloperMatchCard` – skill gap vizualizáció
- [ ] `SelectedTeamPanel` – csapat összeállítás
- [ ] `SimulateCapacityModal` – kapacitás előnézet

### Fázis 4 – Dashboard + Értesítések (3–4 nap)

- [ ] `DashboardPage` – widget-ek összerakása
- [ ] `CapacityTrendChart` – recharts LineChart aggregált adat
- [ ] `SkillDistributionChart` – PieChart skill kategóriák
- [ ] `OverloadAlertPanel`
- [ ] In-app notification system: `uiStore` + `NotificationDrawer`
- [ ] Trigger logika: overload, deadline közelítés

### Fázis 5 – Export + RBAC (3–5 nap)

- [ ] CSV export backend: skill mátrix, assignments
- [ ] Frontend export gombok (letöltés trigger)
- [ ] JWT autentikáció backend: `python-jose`, `passlib`
- [ ] `/api/auth/login` + `/api/auth/me`
- [ ] Frontend route guard (`ProtectedRoute` komponens)
- [ ] Role-alapú UI elemek elrejtése/megjelenítése

### Fázis 6 – Polish + Optimalizáció (folyamatos)

- [ ] Radar chart overlay (több fejlesztő összehasonlítása)
- [ ] Scheduler virtualizáció nagy csapatnál
- [ ] Responsive design (tablet nézet)
- [ ] Error boundary-k + loading skeleton-ök mindenhol
- [ ] Docker production build optimalizáció

---

## 8. Technikai Kihívások és Megoldási Javaslatok

### 1. Scheduler – Overload kalkuláció drag közben (real-time)

**Probléma:** A drag közben folyamatosan kell számolni, hogy az adott napra esne-e >8h, és vizuálisan jelezni kell – de ez ne legyen lassú.

**Megoldás:**
- A `useCapacityCalc` hook `useMemo`-val cache-eli a nap→összes_óra térképet.
- A `useAssignmentDrag` hook drag közben ezt a cache-t kérdezi le (nem API hívás).
- API hívás csak `onDragEnd` után fut (PATCH), nem közben.
- `DragOverlay` komponens piros/zöld border-rel jelzi az overload állapotot.

```ts
// useCapacityCalc.ts – kulcsfüggvény
const dailyHoursMap = useMemo(() => {
  const map: Record<string, number> = {};
  for (const a of assignments) {
    const days = eachDayOfInterval({ start: a.start_date, end: a.end_date });
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      map[key] = (map[key] ?? 0) + a.hours_per_day;
    }
  }
  return map;
}, [assignments]);
```

### 2. Radar Chart – Normalizáció több fejlesztő összehasonlításakor

**Probléma:** Ha az egyik fejlesztőnek hiányzik egy skill bejegyzése, a radar chart összecsukhat egy sarokba.

**Megoldás:**
- Minden radar adatponthoz mindig töltsd ki a teljes skill listát; hiányzó skill = 0.
- Normalizáld az összes értéket 0–5 skálára a `useSkillRadar` hookban.
- Csak azokat a skill-eket jelenítsd meg a tengelyen, amik legalább egy kiválasztott fejlesztőnél be vannak állítva (empty axis elkerülése).

### 3. dnd-timeline – Rezolvancia (nyújtás vs. húzás)

**Probléma:** A `dnd-timeline` alapból húzást (move) támogat; az Assignment blokk nyújtása (jobb/bal széle fogásával) külön implementálandó.

**Megoldás:**
- Resize handlerek: az `AssignmentBlock` bal és jobb szélén külön `<div>` resize handle, amelyek saját `useDraggable` instance-ot kapnak.
- Resize handle drag közben csak az `end_date` vagy `start_date`-t módosítja, nem mozgatja az egész blokkot.
- Minimum 1h és maximum projekt hosszú constraint.

### 4. Match Score – Súlyozás konzisztencia

**Probléma:** Ha a projekt skill-követelmény weightjei nincsenek normalizálva, a score értékek félrevezetőek lehetnek.

**Megoldás:**
- Backend: a `calculateMatchScore` függvény relatív súlyokat használ (osztva az összsúllyal) — abszolút értékek nem számítanak, csak az arányuk.
- A weight értékek UI-ban 1–3 legördülő menüvel megadhatók (low/medium/high), a tényleges float érték a backenden van (0.5 / 1.0 / 2.0).

### 5. SQLite – Konkurens írás

**Probléma:** FastAPI aszinkron modell + SQLite = potenciális "database is locked" hiba egyidejű íráskor.

**Megoldás:**
- `check_same_thread=False` + WAL mód: `PRAGMA journal_mode=WAL;` az app startup-ban.
- Session-per-request dependency (`get_db`) biztosítja a kapcsolat izolációt.
- Jövő: ha nő a terhelés, SQLite → PostgreSQL migráció Alembic-kel minimális kódváltoztatással (SQLModel kompatibilis).

```python
# database.py – WAL mód engedélyezése
@contextmanager
def get_db():
    conn = sqlite3.connect("data/app.db", check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
```

### 6. RBAC – Frontend route guard + API védelem

**Probléma:** Frontend route guard könnyen megkerülhető; az API-n is kell a védelem.

**Megoldás:**
- **Backend:** minden védett endpoint `Depends(get_current_user)` + szerepkör ellenőrzés dependency-ként.
- **Frontend:** `ProtectedRoute` wrapper csak UI-t véd (rossz UX elkerülése), de a tényleges adatbiztonság a backend API-on van.
- JWT token `localStorage`-ban (egyszerűbb) vagy `httpOnly` cookie-ban (biztonságosabb CSRF tokennnel).

### 7. Dátumkezelés – Időzóna-problémák

**Probléma:** SQLite-ban szövegként tárolt dátumok + böngésző lokális időzóna = eltérő nap megjelenítés.

**Megoldás:**
- Mindig UTC-ben tárolj az adatbázisban (`YYYY-MM-DD` formátum, időzóna nélkül, csak dátum).
- Frontend: `date-fns` könyvtár a dátum-manipulációhoz (könnyű, tree-shakeable).
- Dátumokat mindig ISO string formátumban küldj az API-nak; a backenden `datetime.date` típussal fogadd.

---

## Összefoglalás – MVP Scope

Az MVP a következő teljes funkciókból áll:

| Feature | Scope |
|---|---|
| Fejlesztői profilok CRUD | Teljes |
| Skill mátrix + pontszámok | Teljes |
| Radar chart (egy fejlesztő) | Teljes |
| Projekt + task CRUD | Teljes |
| Projekt skill-követelmények | Teljes |
| Drag-and-drop scheduler | Teljes |
| Overload warning | Teljes |
| Team Simulator + Match Score | Teljes |
| Dashboard (alap widgetek) | Részleges |
| RBAC / Auth | Kihagyva (MVP utáni fázis) |
| Export | Kihagyva (MVP utáni fázis) |
| Értesítések | Kihagyva (MVP utáni fázis) |

---

*Ez a dokumentum élő fejlesztési terv. Fázis lezárásakor a teljesített feladatokat jelöld meg és frissítsd a scope-ot.*

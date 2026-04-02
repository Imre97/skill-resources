from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import developers, skills, projects, tasks, assignments, leaves, capacity

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Nexus API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(developers.router)
app.include_router(skills.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(assignments.router)
app.include_router(leaves.router)
app.include_router(capacity.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}

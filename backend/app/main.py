from contextlib import asynccontextmanager
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import ai, auth, dashboard, exposure, notifications, threats
from app.core.config import settings
from app.core.database import async_session, init_db
from app.core.scheduler import scraping_loop
from app.data.seed import seed_database


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    async with async_session() as session:
        await seed_database(session)
    scrape_task = asyncio.create_task(scraping_loop())
    yield
    scrape_task.cancel()
    try:
        await scrape_task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="LeakGuard API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(threats.router, prefix="/api/v1")
app.include_router(exposure.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "leakguard-api"}

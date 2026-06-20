from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.redis_client import cache_get
from app.data.seed import DARKWEB_LEAKS, THREATS, incident_to_api
from app.models.incident import Incident
from app.services.ai_rag import ai_safety_metrics
from app.services.scraping import RANSOMWARE_CACHE_KEY, scrape_ransomware_feed

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis")
async def dashboard_kpis(db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(Incident))
    incidents = [incident_to_api(r) for r in result.scalars().all()]
    if not incidents:
        incidents = THREATS

    today = "2026-06-20"
    return {
        "threatsToday": sum(1 for t in incidents if t.get("date") == today),
        "critical": sum(1 for t in incidents if t.get("status") == "Critical"),
        "verified": sum(1 for t in incidents if t.get("verificationStatus") == "Verified"),
        "pending": sum(1 for t in incidents if t.get("verificationStatus") == "Pending Review"),
        "actors": len({t.get("actor") for t in incidents}),
        "sectors": len({t.get("sector") for t in incidents}),
    }


@router.get("/charts")
async def dashboard_charts(db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(Incident))
    incidents = [incident_to_api(r) for r in result.scalars().all()] or THREATS

    sectors = ["Healthcare", "Finance", "Technology", "Energy", "Government"]
    sector_counts = [sum(1 for t in incidents if t.get("sector") == s) for s in sectors]

    risk_buckets = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for t in incidents:
        st = t.get("status", "Low")
        if st in risk_buckets:
            risk_buckets[st] += 1

    verified = sum(1 for t in incidents if t.get("verificationStatus") == "Verified")
    pending = sum(1 for t in incidents if t.get("verificationStatus") == "Pending Review")
    rejected = sum(1 for t in incidents if t.get("verificationStatus") == "Rejected Incident")

    countries: dict[str, int] = {}
    for t in incidents:
        c = t.get("country", "Unknown")
        countries[c] = countries.get(c, 0) + 1

    return {
        "sectors": {"labels": sectors, "data": sector_counts},
        "riskStatus": {"labels": list(risk_buckets.keys()), "data": list(risk_buckets.values())},
        "verification": {"labels": ["Verified", "Pending", "Rejected"], "data": [verified, pending, rejected]},
        "geo": countries,
    }


@router.get("/darkweb")
async def darkweb_leaks():
    return {"items": DARKWEB_LEAKS}


@router.get("/ransomware-feed")
async def ransomware_feed():
    cached = await cache_get(RANSOMWARE_CACHE_KEY)
    if cached and isinstance(cached, list):
        return {"source": "ransomware.live", "items": cached}
    items = await scrape_ransomware_feed()
    return {"source": "ransomware.live", "items": items}


@router.get("/ai-safety")
async def ai_safety(db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(Incident))
    incidents = [incident_to_api(r) for r in result.scalars().all()] or THREATS
    return ai_safety_metrics(incidents)

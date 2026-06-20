from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional
from app.core.database import get_db
from app.models.consulted_scan import ConsultedScan
from app.models.user import User
from app.schemas import BreachCheckRequest, ScanRequest
from app.services.breach import check_email_breach, fetch_recent_breaches, merge_xon_records, parse_breach_check
from app.services.exposure import (
    calculate_real_risk_percent,
    detect_search_type,
    generate_recommendations,
    parse_osint_response,
)
from app.services.k_anonymity import hash_query
from app.services.notifications import create_notification
from app.services.osint import query_osint

router = APIRouter(prefix="/exposure", tags=["exposure"])


@router.post("/scan")
async def exposure_scan(
    body: ScanRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User | None, Depends(get_current_user_optional)],
):
    query = body.request.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Parámetro request requerido")

    search_type = detect_search_type(query, body.mode)
    is_email_query = body.mode == "email" or "@" in query

    try:
        raw = await query_osint(query, limit=body.limit, lang=body.lang)
    except ValueError as exc:
        if is_email_query:
            raw = None
        else:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        if is_email_query:
            raw = None
        else:
            raise HTTPException(
                status_code=502,
                detail=str(exc) or "Motor de indexación no disponible",
            ) from exc

    records, stats = parse_osint_response(raw)
    if raw is None:
        stats["fromApi"] = False

    if is_email_query:
        try:
            xon_raw = await check_email_breach(query)
            xon = parse_breach_check(xon_raw)
            records, stats = merge_xon_records(records, stats, xon, query)
        except Exception:
            pass

    risk = calculate_real_risk_percent(stats, records)
    recommendations = generate_recommendations(query, search_type, stats, risk)

    scan = ConsultedScan(
        user_id=user.id if user else None,
        query=query,
        query_hash=hash_query(query),
        search_type=search_type,
        risk_score=float(risk["score"]),
        total_logins=int(stats.get("apiTotalResults") or stats.get("totalLogins") or len(records)),
    )
    db.add(scan)
    if user:
        alert_type = "warning" if risk["score"] >= 60 else "success" if risk["score"] < 30 else "info"
        await create_notification(
            db,
            user.id,
            alert_type,
            "exposure",
            f"Exposure check completado ({search_type}) — riesgo {risk['score']}%",
        )
    await db.commit()

    return {
        "query": query,
        "searchType": search_type,
        "records": records,
        "stats": stats,
        "risk": risk,
        "recommendations": recommendations,
    }


@router.get("/consulted")
async def consulted_scans(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User | None, Depends(get_current_user_optional)],
    limit: int = 25,
):
    q = select(ConsultedScan).order_by(ConsultedScan.created_at.desc()).limit(limit)
    if user:
        q = q.where((ConsultedScan.user_id == user.id) | (ConsultedScan.user_id.is_(None)))
    result = await db.execute(q)
    return [
        {
            "query": s.query,
            "searchType": s.search_type,
            "riskScore": s.risk_score,
            "totalLogins": s.total_logins,
            "timestamp": s.created_at.isoformat(),
        }
        for s in result.scalars().all()
    ]


@router.get("/k-anon/{prefix}")
async def k_anon_search(prefix: str, db: Annotated[AsyncSession, Depends(get_db)]):
    if len(prefix) < 5 or len(prefix) > 10:
        raise HTTPException(status_code=400, detail="Prefijo debe tener 5-10 caracteres")
    result = await db.execute(
        select(ConsultedScan.query_hash).where(ConsultedScan.query_hash.startswith(prefix))
    )
    hashes = [row[0] for row in result.all() if row[0]]
    return {"prefix": prefix, "hashes": hashes}


@router.post("/breach-check")
async def breach_check(body: BreachCheckRequest):
    try:
        data = await check_email_breach(body.email)
        return {**data, "parsed": parse_breach_check(data)}
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Servicio OSINT gratuito no disponible") from exc


@router.get("/breaches-recent")
async def breaches_recent():
    try:
        return await fetch_recent_breaches()
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Servicio OSINT gratuito no disponible") from exc

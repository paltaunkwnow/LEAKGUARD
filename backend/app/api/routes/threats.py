from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.data.seed import incident_to_api
from app.models.audit_log import AuditLog
from app.models.incident import Incident
from app.models.user import User
from app.schemas import VerifyIncidentRequest
from app.services.notifications import create_notification

router = APIRouter(prefix="/threats", tags=["threats"])


@router.get("")
async def list_threats(db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(Incident).order_by(Incident.date.desc()))
    rows = result.scalars().all()
    return [incident_to_api(r) for r in rows]


@router.get("/admin/queue")
async def admin_queue(db: Annotated[AsyncSession, Depends(get_db)], _user: Annotated[User, Depends(get_current_user)]):
    result = await db.execute(select(Incident).order_by(Incident.date.desc()))
    incidents = [incident_to_api(r) for r in result.scalars().all()]
    pending = [i for i in incidents if i["verificationStatus"] == "Pending Review"]
    return {
        "pending": len(pending),
        "verified": sum(1 for i in incidents if i["verificationStatus"] == "Verified"),
        "rejected": sum(1 for i in incidents if i["verificationStatus"] == "Rejected Incident"),
        "incidents": sorted(incidents, key=lambda x: (0 if x["verificationStatus"] == "Pending Review" else 1)),
    }


@router.get("/admin/audits")
async def list_audits(db: Annotated[AsyncSession, Depends(get_db)], _user: Annotated[User, Depends(get_current_user)]):
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()))
    return [
        {"timestamp": a.timestamp.isoformat(), "analyst": a.analyst, "action": a.action, "reason": a.reason}
        for a in result.scalars().all()
    ]


@router.get("/{incident_id}")
async def get_threat(incident_id: str, db: Annotated[AsyncSession, Depends(get_db)]):
    row = await db.get(Incident, incident_id)
    if not row:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")
    return incident_to_api(row)


@router.post("/{incident_id}/verify")
async def verify_incident(
    incident_id: str,
    body: VerifyIncidentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    row = await db.get(Incident, incident_id)
    if not row:
        raise HTTPException(status_code=404, detail="Incidente no encontrado")

    status_map = {"verify": "Verified", "reject": "Rejected Incident"}
    new_status = status_map.get(body.action.lower())
    if not new_status:
        raise HTTPException(status_code=400, detail="action debe ser verify o reject")

    row.verification_status = new_status
    db.add(AuditLog(analyst=user.name, action=body.action, reason=body.reason))
    await create_notification(
        db,
        user.id,
        "info",
        "admin",
        f"Incidente {incident_id} actualizado a {new_status} por {user.name}",
    )
    await db.commit()
    return incident_to_api(row)

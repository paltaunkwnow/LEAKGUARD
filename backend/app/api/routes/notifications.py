from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.notifications import list_notifications, mark_all_read, mark_read, unread_count

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _serialize(n) -> dict:
    return {
        "id": n.id,
        "type": n.type,
        "category": n.category,
        "message": n.message,
        "read": n.read,
        "created_at": n.created_at.isoformat(),
    }


@router.get("")
async def get_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    limit: int = 50,
):
    rows = await list_notifications(db, user.id, limit=limit)
    return [_serialize(n) for n in rows]


@router.get("/unread-count")
async def get_unread_count(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    return {"count": await unread_count(db, user.id)}


@router.patch("/{notification_id}/read")
async def read_notification(
    notification_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    ok = await mark_read(db, user.id, notification_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    await db.commit()
    return {"ok": True}


@router.post("/mark-all-read")
async def read_all_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    updated = await mark_all_read(db, user.id)
    await db.commit()
    return {"updated": updated}

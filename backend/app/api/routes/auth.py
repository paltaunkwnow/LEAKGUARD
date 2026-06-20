from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.services.breach import check_email_breach, parse_breach_check
from app.services.censor import censor_email
from app.services.notifications import create_notification

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    user = User(
        email=body.email.lower(),
        hashed_password=hash_password(body.password),
        name=body.name,
        role="Threat Intelligence Analyst",
        clearance="L2 Access",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    breach_alert = None
    try:
        raw = await check_email_breach(body.email)
        parsed = parse_breach_check(raw)
        breach_alert = _format_breach_alert(parsed, body.email, is_register=True)
    except Exception:
        breach_alert = {"type": "info", "message": f"No se pudo verificar filtraciones para {censor_email(body.email)}"}

    if breach_alert:
        await create_notification(
            db, user.id, breach_alert["type"], "account-breach", breach_alert["message"]
        )
        await db.commit()

    token = create_access_token(user.email, {"uid": user.id, "name": user.name})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role, "clearance": user.clearance},
        breach_alert=breach_alert,
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(User).where(User.email == body.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    breach_alert = None
    try:
        raw = await check_email_breach(body.email)
        parsed = parse_breach_check(raw)
        breach_alert = _format_breach_alert(parsed, body.email, is_register=False)
    except Exception:
        breach_alert = {"type": "info", "message": f"No se pudo verificar filtraciones para {censor_email(body.email)}"}

    if breach_alert:
        await create_notification(
            db, user.id, breach_alert["type"], "account-breach", breach_alert["message"]
        )
        await db.commit()

    token = create_access_token(user.email, {"uid": user.id, "name": user.name})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role, "clearance": user.clearance},
        breach_alert=breach_alert,
    )


@router.post("/demo")
async def demo_login():
    token = create_access_token("demo@leakguard.local", {"uid": 0, "name": "Demo Analyst", "demo": True})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": 0,
            "email": "demo@leakguard.local",
            "name": "Maria Lopez",
            "role": "Lead Threat Intelligence Analyst",
            "clearance": "L3 Admin Access",
        },
    }


@router.get("/me")
async def me(user: Annotated[User | None, Depends(get_current_user_optional)]):
    if not user:
        return {"authenticated": False}
    return {
        "authenticated": True,
        "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role, "clearance": user.clearance},
    }


def _format_breach_alert(parsed: dict, email: str, is_register: bool) -> dict:
    censored = censor_email(email)
    if parsed.get("exposed"):
        sample = ", ".join(parsed.get("breaches", [])[:4])
        extra = f" (+{parsed['breachCount'] - 4} más)" if parsed["breachCount"] > 4 else ""
        risk = f" · Riesgo XON: {parsed['riskScore']}" if parsed.get("riskScore") is not None else ""
        return {
            "type": "warning",
            "message": f"{'Bienvenido' if is_register else 'Alerta de sesión'}: {censored} aparece en {parsed['breachCount']} filtración(es) — {sample}{extra}{risk}",
        }
    return {
        "type": "success",
        "message": f"{'Registro seguro' if is_register else 'Sesión verificada'}: {censored} no aparece en el índice público XposedOrNot.",
    }

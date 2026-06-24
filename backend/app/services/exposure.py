import math
import re
from typing import Any

from app.services.censor import (
    censor_hash,
    censor_password,
    extract_osint_date,
    format_login_display,
    normalize_osint_entry,
    severity_from_record,
)
from app.services.response_sanitize import build_public_breach_record


def parse_osint_response(data: dict[str, Any] | None) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    records: list[dict[str, Any]] = []
    stats: dict[str, Any] = {
        "totalLogins": 0,
        "totalDatabases": 0,
        "databasesWithHits": 0,
        "plaintextPasswords": 0,
        "hashedPasswords": 0,
        "apiTotalResults": None,
        "apiNumDatabases": None,
        "fromApi": True,
    }

    if not data or not isinstance(data, dict):
        return records, stats

    stats["apiTotalResults"] = data.get("NumOfResults") or data.get("numOfResults") or data.get("NumResults")
    stats["apiNumDatabases"] = data.get("NumOfDatabase") or data.get("numOfDatabase") or data.get("NumDatabase")

    lst = data.get("List") or data.get("list") or data.get("results") or {}
    if not isinstance(lst, dict):
        return records, stats

    sum_reported = 0

    for source_name, source_data in lst.items():
        if not source_data or not isinstance(source_data, dict):
            continue

        stats["totalDatabases"] += 1
        entries = source_data.get("Data") or source_data.get("data") or source_data.get("records") or []
        db_count = int(source_data.get("NumOfResults") or source_data.get("numOfResults") or 0)
        if db_count > 0:
            sum_reported += db_count
        info = source_data.get("InfoLeak") or source_data.get("info") or source_name
        title = info if isinstance(info, str) and len(info) > 3 else source_name

        if isinstance(entries, list) and entries:
            stats["databasesWithHits"] += 1
            stats["totalLogins"] += len(entries)
            if not db_count:
                sum_reported += len(entries)

            for entry in entries:
                if not isinstance(entry, dict):
                    continue
                normalized = normalize_osint_entry(entry)
                severity = severity_from_record(normalized)

                pwd = normalized.get("password")
                if pwd:
                    if pwd.startswith("$") or pwd.lower().startswith("sha") or len(pwd) > 48:
                        stats["hashedPasswords"] += 1
                    else:
                        stats["plaintextPasswords"] += 1
                elif normalized.get("hash"):
                    stats["hashedPasswords"] += 1

                login_display = format_login_display(normalized)

                cred = (
                    censor_password(pwd)
                    if pwd
                    else censor_hash(normalized["hash"])
                    if normalized.get("hash")
                    else "—"
                )

                entry_date = extract_osint_date(entry, source_data)
                if entry_date == "—":
                    match = re.search(r"\b(19\d{2}|20\d{2})\b", source_name)
                    if match:
                        entry_date = match.group(1)

                records.append(
                    build_public_breach_record(
                        entry_date=entry_date,
                        source_name=source_name,
                        login_display=login_display,
                        credential=cred,
                        severity=severity,
                    )
                )
        elif source_data.get("InfoLeak"):
            stats["databasesWithHits"] += 1
            fallback_date = "—"
            match = re.search(r"\b(19\d{2}|20\d{2})\b", source_name)
            if match:
                fallback_date = match.group(1)
            else:
                raw_date = extract_osint_date({}, source_data)
                if raw_date != "—":
                    fallback_date = raw_date

            records.append(
                build_public_breach_record(
                    entry_date=fallback_date,
                    source_name=source_name,
                    login_display="—",
                    credential="—",
                    severity="Medium",
                    indicators=str(source_data["InfoLeak"]),
                )
            )

    if stats["apiTotalResults"] is None and sum_reported > 0:
        stats["apiTotalResults"] = sum_reported
    if stats["apiTotalResults"] is None:
        stats["apiTotalResults"] = stats["totalLogins"]
    if stats["apiNumDatabases"] is None:
        stats["apiNumDatabases"] = stats["databasesWithHits"]

    stats["recordsReturned"] = len(records)
    return records, stats


def calculate_real_risk_percent(stats: dict[str, Any], records: list[dict[str, Any]]) -> dict[str, Any]:
    if not records:
        return {"score": 0, "level": "Sin Riesgo", "levelClass": "text-green-400", "barColor": "#22c55e"}

    login_count = stats.get("apiTotalResults") or stats.get("totalLogins") or len(records)
    db_count = stats.get("databasesWithHits") or stats.get("apiNumDatabases") or 1
    plaintext = stats.get("plaintextPasswords") or 0
    hashed = stats.get("hashedPasswords") or 0

    score = 0.0
    score += min(35, math.log10(login_count + 1) * 15)
    score += min(25, db_count * 4)
    score += min(30, plaintext * 6)
    score += min(12, hashed * 2)

    has_passwords = (plaintext > 0 or hashed > 0)

    if login_count >= 50:
        score = max(score, 85 if has_passwords else 45)
    elif login_count >= 20:
        score = max(score, 70 if has_passwords else 35)
    elif login_count >= 5:
        score = max(score, 55 if has_passwords else 25)

    if plaintext >= 3:
        score = max(score, 78)
    elif plaintext >= 1:
        score = max(score, 60)

    score = round(min(99, max(8, score)))

    if score >= 80:
        return {"score": score, "level": "Crítico", "levelClass": "text-red-400", "barColor": "#ef4444"}
    if score >= 60:
        return {"score": score, "level": "Alto", "levelClass": "text-orange-400", "barColor": "#f97316"}
    if score >= 35:
        return {"score": score, "level": "Moderado", "levelClass": "text-yellow-500", "barColor": "#eab308"}
    return {"score": score, "level": "Bajo", "levelClass": "text-green-400", "barColor": "#22c55e"}


def generate_recommendations(query: str, search_type: str, stats: dict[str, Any], risk: dict[str, Any]) -> list[dict[str, Any]]:
    recs: list[dict[str, Any]] = []
    login_count = stats.get("apiTotalResults") or stats.get("totalLogins") or 0
    has_plaintext = (stats.get("plaintextPasswords") or 0) > 0

    if risk["score"] >= 70 or has_plaintext:
        recs.append(
            {
                "priority": "Inmediato",
                "color": "red",
                "items": [
                    "Cambiar todas las contraseñas asociadas a este activo de forma inmediata.",
                    f"Se detectaron {stats.get('plaintextPasswords', 0)} contraseña(s) en texto claro — asumir compromiso total."
                    if has_plaintext
                    else "Rotar credenciales en todos los servicios donde se haya reutilizado esta cuenta.",
                    "Activar autenticación multifactor (MFA) en cuentas críticas vinculadas.",
                ],
            }
        )

    if login_count >= 3 or (stats.get("databasesWithHits") or 0) >= 2:
        recs.append(
            {
                "priority": "24 Horas",
                "color": "orange",
                "items": [
                    f"Revisar {stats.get('databasesWithHits', 0)} base(s) de filtración indexada(s) para identificar servicios afectados.",
                    "Auditar inicios de sesión recientes y cerrar sesiones activas sospechosas.",
                    "Verificar si el correo aparece en listas de spam/phishing dirigido (spear phishing).",
                ],
            }
        )

    if search_type == "Correo Electrónico (Email)":
        week_items = [
            "Implementar un gestor de contraseñas y eliminar reutilización de credenciales.",
            "Monitorear alertas de Have I Been Pwned y fuentes OSINT periódicamente.",
            "Capacitar al usuario sobre phishing y suplantación de identidad.",
        ]
    elif search_type == "Dominio Corporativo":
        week_items = [
            "Forzar reset de contraseñas corporativas para cuentas expuestas detectadas.",
            "Desplegar escaneo continuo de credenciales en repos dark web.",
            "Revisar políticas de acceso externo (VPN, RDP, portales web).",
        ]
    else:
        week_items = [
            "Validar titularidad del número y bloquear SIM swap no autorizado.",
            "No compartir códigos OTP recibidos por SMS con terceros.",
            "Considerar migrar verificación 2FA a app autenticadora en lugar de SMS.",
        ]

    recs.append({"priority": "7 Días", "color": "yellow", "items": week_items})

    if risk["score"] < 35:
        recs.insert(
            0,
            {
                "priority": "Preventivo",
                "color": "cyan",
                "items": [
                    "Exposición limitada detectada — mantener monitoreo periódico.",
                    "Aplicar contraseñas únicas y MFA como medida preventiva.",
                    f'Consulta "{query}" sin filtraciones críticas en el índice actual.',
                ],
            },
        )

    return recs[:3]


def detect_search_type(query: str, mode: str) -> str:
    if mode == "email" or "@" in query:
        return "Correo Electrónico (Email)"
    if mode == "phone" or re.match(r"^\+?[0-9\-\s().]{7,20}$", query):
        return "Número Telefónico"
    if mode == "domain" or "." in query:
        return "Dominio Corporativo"
    return "Consulta General"

import os
import re
import json
import sqlite3
import urllib.request
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
app = FastAPI(title="Aegis Cyber Security Consulting Hub")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "aegis.db"
BREACH_API_URL = "https://leakosintapi.com/"
BREACH_API_TOKEN = "8947909479:o3pE83Li"

# --- SQLITE DATABASE MANAGER ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_config (
            key TEXT PRIMARY KEY,
            val TEXT
        )
    """)
    # Seed default protection values
    cursor.execute("INSERT OR IGNORE INTO system_config (key, val) VALUES ('bo_protection', '1')")
    cursor.execute("INSERT OR IGNORE INTO system_config (key, val) VALUES ('prompt_shield', '1')")
    conn.commit()
    conn.close()

init_db()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_config(key: str, default: str) -> str:
    conn = get_db_connection()
    row = conn.execute("SELECT val FROM system_config WHERE key = ?", (key,)).fetchone()
    conn.close()
    return row["val"] if row else default

def set_config(key: str, val: str):
    conn = get_db_connection()
    conn.execute("INSERT OR REPLACE INTO system_config (key, val) VALUES (?, ?)", (key, val))
    conn.commit()
    conn.close()

def query_leak_osint(query_str: str) -> dict:
    payload = {
        "token": BREACH_API_TOKEN,
        "request": query_str,
        "limit": 500,
        "lang": "es"
    }
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            BREACH_API_URL, 
            data=data, 
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            res_body = response.read().decode('utf-8')
            return json.loads(res_body)
    except Exception as e:
        print(f"Error calling LeakOSINT: {e}")
        return {"error": str(e)}

# --- PROMPT INJECTION SHIELD SCANNER ---
def check_prompt_injection(user_input: str) -> tuple[bool, str]:
    # Custom rule-based scan for common prompt injection patterns
    injection_patterns = [
        (r'(?i)ignore\b.*\binstructions', "Ignore Instructions Bypass"),
        (r'(?i)system\b.*\boverride', "System Settings Override"),
        (r'(?i)act\b.*\bas\b.*\bgpt', "Persona Impersonation"),
        (r'(?i)olvida\b.*\binstrucciones', "Spanish Forget Instructions"),
        (r'(?i)ejecuta\b.*\bcomandos', "Remote Command Request"),
        (r'(?i)delete\b.*\bdatabase', "Destructive Command Injection"),
        (r'(?i)bypassear\b.*\bseguridad', "Security Bypass Terminology")
    ]
    
    for pattern, name in injection_patterns:
        if re.search(pattern, user_input):
            return True, name
    return False, ""

def ask_local_security_assistant(user_prompt: str, leak_context: str = "") -> str:
    # Offline Local Security Engine (Zero cost, Zero token usage, Zero external API latency)
    if leak_context:
        # Convert raw leak_context data into a neat list of up to 10 leaks
        lines = [line.strip() for line in leak_context.split("\n") if "DB:" in line]
        if lines:
            formatted_list = "\n".join([f"{i+1}. {line}" for i, line in enumerate(lines[:10])])
            return (
                f"Auditoría Aegis OSINT: Se han detectado registros expuestos para el objetivo. "
                f"A continuación se detallan las 10 credenciales exfiltradas:\n\n{formatted_list}"
            )
        return f"Auditoría Aegis OSINT: {leak_context}"
    
    prompt_lower = user_prompt.lower()
    if "rag" in prompt_lower or "base de datos" in prompt_lower or "vector" in prompt_lower:
        return "Aegis RAG Guard asegura tus bases de datos vectoriales filtrando inyecciones indirectas y cifrando metadatos sensibles."
    elif "injection" in prompt_lower or "prompt" in prompt_lower or "jailbreak" in prompt_lower or "shield" in prompt_lower:
        return "Mitigamos inyecciones semánticas a nivel de gateway, analizando heurísticas maliciosas antes de que lleguen a tu LLM."
    elif "pentest" in prompt_lower or "hack" in prompt_lower or "vulnerabilidad" in prompt_lower:
        return "Nuestros Pentests simulan ataques en vivo sobre tu infraestructura para detectar puertos abiertos e inyecciones de código."
    elif "osint" in prompt_lower or "correo" in prompt_lower or "telefono" in prompt_lower:
        return "El escáner OSINT de Aegis monitorea foros hacker y bases de datos expuestas para alertar sobre credenciales filtradas."
    
    # Generic responses
    import random
    respuestas = [
        "Aegis aconseja implementar políticas de mínimo privilegio (RBAC) y habilitar MFA en toda la infraestructura corporativa.",
        "Sanitizar los prompts y estructurar las respuestas es el primer paso para proteger aplicaciones basadas en modelos de lenguaje.",
        "Para cualquier consulta o soporte técnico adicional, contáctanos en support@aegis.com."
    ]
    return random.choice(respuestas)

# --- API MODELS ---
class ChatRequest(BaseModel):
    query: str
    protection: bool

# --- ROUTING ENDPOINTS ---
@app.get("/")
async def get_index():
    return FileResponse("index.html")

@app.post("/chat")
async def handle_chat_request(req: ChatRequest):
    query = req.query.strip()
    
    # Store dynamic toggle configuration from client
    set_config("bo_protection", "1" if req.protection else "0")

    # 1. First run prompt injection shield (if active)
    shield_active = get_config("prompt_shield", "1") == "1"
    if shield_active:
        is_inj, inj_name = check_prompt_injection(query)
        if is_inj:
            return {
                "response": f"[PROMPT SHIELD DETECTED: {inj_name}] Petición bloqueada automáticamente por Aegis Dynamic Guardrails.",
                "log": f"VECTORES DE ATAQUE: Bloqueada inyección '{inj_name}' en la consulta de entrada.",
                "leak": False
            }

    leak_data_summary = ""
    is_email = bool(re.match(r'[^@]+@[^@]+\.[^@]+', query))
    is_phone = bool(re.match(r'^\+?\d{8,15}$', query))
    
    if "leak" in query.lower() or "filtrac" in query.lower() or "breach" in query.lower() or is_email or is_phone:
        potential_targets = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+|[+]?\d{8,15}', query)
        target = potential_targets[0] if potential_targets else query
        
        # When switch is ON, block ALL requests regardless of domain
        if req.protection:
            return {
                "response": "[DATA PROTECTED - ACTIVE SECURITY SHIELD] La base de datos Aegis ha bloqueado esta consulta para prevenir la exfiltración de registros corporativos.",
                "log": f"ACCESO DENEGADO: Intento de consulta de auditoría bloqueado por Aegis Shield.",
                "leak": False
            }
        
        res = query_leak_osint(target)
        leak_list = res.get("List", {})
        
        # Parse and gather up to 10 actual credentials/lines from the database dump
        extracted_leaks = []
        if leak_list and isinstance(leak_list, dict):
            for db_name, db_info in leak_list.items():
                if isinstance(db_info, dict) and "Data" in db_info:
                    records = db_info["Data"]
                    if isinstance(records, list):
                        for rec in records:
                            if len(extracted_leaks) >= 10:
                                break
                            email_val = rec.get("Email") or rec.get("UserName") or rec.get("Login") or "N/A"
                            pass_val = rec.get("Password") or rec.get("Hash") or "N/A"
                            extracted_leaks.append(f"DB: {db_name} | Email/User: {email_val} | Pass: {pass_val}")
                if len(extracted_leaks) >= 10:
                    break
        
        if extracted_leaks:
            # Format the exactly 10 exposures
            leak_data_summary = (
                f"IMPORTANTE: Se han encontrado filtraciones reales para '{target}'. Debes enumerar explícitamente y de forma obligatoria las siguientes credenciales comprometidas (mostrando hasta 10 si están disponibles):\n"
                + "\n".join(extracted_leaks)
            )
        else:
            leak_data_summary = f"No se encontraron filtraciones para '{target}' en las bases de datos de LeakOSINT."

    assistant_reply = ask_local_security_assistant(query, leak_context=leak_data_summary)
    
    has_leaks = "filtraciones reales" in leak_data_summary
    log_msg = f"EXFILTRACIÓN CRÍTICA: Expuestos registros confidenciales de '{query}'." if (has_leaks and not req.protection) else ("CONSULTA OSINT: Identificador limpio." if not has_leaks else "IA CONSULTA: Respuesta de IA generada.")
    
    return {
        "response": assistant_reply,
        "log": log_msg,
        "leak": has_leaks and not req.protection
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

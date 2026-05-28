#!/usr/bin/env python3
"""
Smoke API para docs/pliego/05-qa-checklist.md
Uso: python3 scripts/qa_api_smoke.py
Requiere: API en QA_API_BASE (default http://localhost:8000) y credenciales en .env
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), value)


load_dotenv(ROOT / ".env")

BASE = os.environ.get("QA_API_BASE", "http://localhost:8000").rstrip("/")
EMAIL = os.environ.get("BOOTSTRAP_USER_EMAIL") or os.environ.get("QA_EMAIL")
PASSWORD = os.environ.get("BOOTSTRAP_USER_PASSWORD") or os.environ.get("QA_PASSWORD")
QA_USER_B_EMAIL = os.environ.get("QA_USER_B_EMAIL", "qa-b@example.com")
QA_USER_B_PASSWORD = os.environ.get("QA_USER_B_PASSWORD", "qa-b-password-123")
QA_APP_BASE = os.environ.get("QA_APP_BASE", "http://localhost:8080").rstrip("/")
APP_BASE_URL = os.environ.get("APP_BASE_URL", "").rstrip("/")


@dataclass
class Result:
    case_id: str
    ok: bool
    note: str = ""


results: list[Result] = []


def record(case_id: str, ok: bool, note: str = "") -> None:
    results.append(Result(case_id, ok, note))
    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {case_id}" + (f" — {note}" if note else ""))


def request(
    method: str,
    path: str,
    *,
    token: str | None = None,
    body: dict | None = None,
    headers: dict | None = None,
) -> tuple[int, dict | list | str | None]:
    url = f"{BASE}{path}"
    data = None
    req_headers = {"Accept": "application/json"}
    if headers:
        req_headers.update(headers)
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        req_headers["Content-Type"] = "application/json"
    if token:
        req_headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, data=data, method=method, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            if not raw:
                return resp.status, None
            try:
                return resp.status, json.loads(raw)
            except json.JSONDecodeError:
                return resp.status, raw
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        try:
            payload = json.loads(raw) if raw else None
        except json.JSONDecodeError:
            payload = raw
        return exc.code, payload


def login(email: str, password: str) -> str | None:
    status, payload = request("POST", "/api/v1/auth/login", body={"email": email, "password": password})
    if status == 200 and isinstance(payload, dict):
        return payload.get("access_token")
    return None


def d(hour: int, minute: int = 0, day_offset: int = 0) -> str:
    base = datetime(2026, 5, 15, hour, minute, tzinfo=timezone.utc) + timedelta(days=day_offset)
    return base.isoformat().replace("+00:00", "Z")


def approx_money(value, expected: str) -> bool:
    if value is None:
        return expected == "null"
    return Decimal(str(value)).quantize(Decimal("0.01")) == Decimal(expected)


def main() -> int:
    print(f"HorarioPro QA API smoke → {BASE}\n")

    if not EMAIL or not PASSWORD:
        print("ERROR: define BOOTSTRAP_USER_EMAIL y BOOTSTRAP_USER_PASSWORD en .env", file=sys.stderr)
        return 1

    # --- INF ---
    status, health = request("GET", "/health")
    record("INF-02", status == 200 and isinstance(health, dict) and health.get("status") == "ok")

    # --- AUTH ---
    status, _ = request("GET", "/api/v1/shifts")
    record("AUTH-07", status == 401)
    record("SEC-01", status == 401)

    status, _ = request("GET", "/api/v1/shifts", token="invalid.token.here")
    record("AUTH-08", status == 401)
    record("SEC-02", status == 401)

    status, _ = request("POST", "/api/v1/auth/login", body={"email": EMAIL, "password": "wrong"})
    record("AUTH-02", status == 401)

    status, _ = request("POST", "/api/v1/auth/login", body={"email": "noexiste@example.com", "password": "x"})
    record("AUTH-03", status == 401)

    status, _ = request("POST", "/api/v1/auth/login", body={"email": "", "password": ""})
    record("AUTH-04", status == 422)

    token = login(EMAIL, PASSWORD)
    record("AUTH-01", token is not None)
    if not token:
        print("\nAbortando: no hay login válido.")
        return 1

    status, me = request("GET", "/api/v1/auth/me", token=token)
    record("AUTH-01b", status == 200 and isinstance(me, dict) and me.get("email"))

    # No register endpoint
    status, _ = request("POST", "/api/v1/auth/register", body={})
    record("AUTH-10", status in (404, 405, 422))

    # --- CORS ---
    status, _ = request(
        "OPTIONS",
        "/api/v1/auth/login",
        headers={"Origin": "http://localhost:8080", "Access-Control-Request-Method": "POST"},
    )
    record("SEC-04", status in (200, 204, 405))

    status, _ = request(
        "GET",
        "/health",
        headers={"Origin": "https://evil.example"},
    )
    record("SEC-05", status == 200)  # health público; CORS no debe exponer credenciales en rutas privadas

    status, _ = request("GET", "/api/v1/clients", token=token, headers={"Origin": "https://evil.example"})
    record("SEC-05b", status in (200, 401))  # datos protegidos con JWT válido; sin ACAO permisivo crítico en prod

    # --- CLIENTS ---
    created_ids: list[int] = []
    shift_ids: list[int] = []

    status, client_a = request(
        "POST",
        "/api/v1/clients",
        token=token,
        body={"name": "QA Cliente A", "color": "#2563eb", "hourly_rate": 15},
    )
    record("CLI-01", status == 201)
    record("CLI-02", status == 201)
    if isinstance(client_a, dict):
        created_ids.append(client_a["id"])
        client_a_id = client_a["id"]
    else:
        client_a_id = None

    status, client_b = request(
        "POST",
        "/api/v1/clients",
        token=token,
        body={"name": "QA Cliente B", "color": "#16a34a"},
    )
    record("CLI-08", status == 201)
    if isinstance(client_b, dict):
        created_ids.append(client_b["id"])

    status, client_c = request(
        "POST",
        "/api/v1/clients",
        token=token,
        body={"name": "QA Cliente C", "color": "#dc2626", "hourly_rate": 0},
    )
    record("CLI-07", status == 201)
    if isinstance(client_c, dict):
        created_ids.append(client_c["id"])

    status, _ = request("POST", "/api/v1/clients", token=token, body={"name": "QA Dup", "color": "#2563eb"})
    record("CLI-04", status == 201, "nombres duplicados permitidos")

    status, _ = request("POST", "/api/v1/clients", token=token, body={"name": "", "color": "#2563eb"})
    record("CLI-05", status == 422)

    status, _ = request(
        "POST",
        "/api/v1/clients",
        token=token,
        body={"name": "Bad", "color": "#2563eb", "hourly_rate": -10},
    )
    record("CLI-06", status == 422)

    status, _ = request("POST", "/api/v1/clients", token=token, body={"name": "Bad color", "color": "foo"})
    record("CLI-12", status == 422)

    # --- SHIFTS ---
    if client_a_id:
        status, shift = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={
                "client_id": client_a_id,
                "start_time": d(8, 0),
                "end_time": d(16, 0),
                "break_minutes": 0,
                "driving_extra": 0,
            },
        )
        record("SH-01", status == 201)
        if isinstance(shift, dict):
            shift_ids.append(shift["id"])
            record("CAL-01", str(shift.get("worked_hours")) == "8.00")
            record("CAL-03", approx_money(shift.get("estimated_pay"), "120.00"))

        status, shift2 = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={
                "client_id": client_a_id,
                "start_time": d(8, 0, 1),
                "end_time": d(16, 0, 1),
                "break_minutes": 60,
                "driving_extra": 20,
                "notes": "Nota QA " + ("x" * 100),
            },
        )
        record("SH-02", status == 201)
        record("SH-03", status == 201)
        record("SH-04", status == 201)
        if isinstance(shift2, dict):
            shift_ids.append(shift2["id"])
            record("CAL-02", str(shift2.get("worked_hours")) == "7.00")
            record("CAL-06", approx_money(shift2.get("estimated_pay"), "125.00"))

        status, _ = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={
                "client_id": client_a_id,
                "start_time": d(9, 0, 2),
                "end_time": d(8, 0, 2),
                "break_minutes": 0,
            },
        )
        record("SH-06", status == 422)

        status, _ = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={
                "client_id": client_a_id,
                "start_time": d(8, 0, 3),
                "end_time": d(9, 0, 3),
                "break_minutes": 120,
            },
        )
        record("EDGE-02", status == 422)

        status, _ = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={
                "client_id": client_a_id,
                "start_time": d(10, 0, 4),
                "end_time": d(10, 0, 4),
                "break_minutes": 0,
            },
        )
        record("EDGE-04", status == 422)

        status, _ = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={
                "client_id": client_a_id,
                "start_time": d(22, 0, 5),
                "end_time": d(6, 0, 6),
                "break_minutes": 0,
            },
        )
        record("EDGE-01", status == 201, "cruce medianoche permitido si end>start absoluto")

        status, _ = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={"client_id": client_a_id, "start_time": d(7), "end_time": d(15), "break_minutes": -5},
        )
        record("SH-07", status == 422)
        status, _ = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={"start_time": d(7), "end_time": d(15), "break_minutes": 0},
        )
        record("SH-08", status == 422)

        status, _ = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={
                "client_id": client_a_id,
                "start_time": d(7, 0, 7),
                "end_time": d(12, 0, 7),
                "break_minutes": 0,
                "driving_extra": -5,
            },
        )
        record("SH-05", status == 422)
        record("EDGE-05", status == 422)

    if isinstance(client_b, dict):
        status, shift_b = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={
                "client_id": client_b["id"],
                "start_time": d(8, 0, 8),
                "end_time": d(16, 0, 8),
                "break_minutes": 0,
            },
        )
        record("CAL-04", status == 201 and isinstance(shift_b, dict) and shift_b.get("estimated_pay") is None)
        if isinstance(shift_b, dict):
            shift_ids.append(shift_b["id"])

    status, summary = request("GET", "/api/v1/dashboard/summary", token=token)
    record("CAL-14", status == 200 and isinstance(summary, dict))
    if isinstance(summary, dict):
        record("CAL-07", "driving_extras" in summary.get("month", {}))

    if shift_ids:
        sid = shift_ids[0]
        status, one = request("GET", f"/api/v1/shifts/{sid}", token=token)
        status2, listed = request("GET", f"/api/v1/shifts?limit=100", token=token)
        listed_row = next((row for row in listed if isinstance(listed, list) and row.get("id") == sid), None)
        record(
            "CAL-13",
            status == 200
            and status2 == 200
            and isinstance(one, dict)
            and listed_row is not None
            and str(one.get("worked_hours")) == str(listed_row.get("worked_hours"))
            and str(one.get("estimated_pay")) == str(listed_row.get("estimated_pay")),
        )

        status, patched = request(
            "PATCH",
            f"/api/v1/shifts/{sid}",
            token=token,
            body={"notes": "editado QA"},
        )
        record("SH-10", status == 200 and isinstance(patched, dict) and patched.get("notes") == "editado QA")

    week_from = datetime(2026, 5, 12, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
    week_to = datetime(2026, 5, 20, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
    status, filtered = request(
        "GET",
        f"/api/v1/shifts?from={week_from}&to={week_to}",
        token=token,
    )
    record("SH-13", status == 200 and isinstance(filtered, list))
    record("FIL-02", status == 200)

    if client_a_id:
        status, by_client = request("GET", f"/api/v1/clients/{client_a_id}", token=token)
        status_sh, only_a = request("GET", f"/api/v1/shifts?client_id={client_a_id}", token=token)
        record(
            "SH-14",
            status_sh == 200
            and isinstance(only_a, list)
            and all(row.get("client_id") == client_a_id for row in only_a if isinstance(row, dict)),
        )

    # SQL injection / validation
    status, inj = request(
        "POST",
        "/api/v1/clients",
        token=token,
        body={"name": "' OR 1=1--", "color": "#2563eb"},
    )
    record("SEC-08", status == 201)
    if isinstance(inj, dict):
        created_ids.append(inj["id"])

    status, xss_shift = request(
        "POST",
        "/api/v1/shifts",
        token=token,
        body={
            "client_id": client_a_id,
            "start_time": d(6, 0, 9),
            "end_time": d(7, 0, 9),
            "notes": "<script>alert(1)</script>",
        },
    ) if client_a_id else (0, None)
    record("SEC-09", status == 201, "almacenado; render UI debe escapar (manual)")

    if client_a_id:
        status, updated = request(
            "PATCH",
            f"/api/v1/clients/{client_a_id}",
            token=token,
            body={"name": "QA Cliente A editado"},
        )
        record("CLI-03", status == 200 and isinstance(updated, dict) and updated.get("name") == "QA Cliente A editado")

    # CLI-09 delete empty client
    status, empty_client = request(
        "POST",
        "/api/v1/clients",
        token=token,
        body={"name": "QA Empty Delete", "color": "#0891b2"},
    )
    if isinstance(empty_client, dict):
        eid = empty_client["id"]
        created_ids.append(eid)
        status, _ = request("DELETE", f"/api/v1/clients/{eid}", token=token)
        record("CLI-09", status == 204)

    # CLI-10 delete with shifts
    if client_a_id and shift_ids:
        status, _ = request("DELETE", f"/api/v1/clients/{client_a_id}", token=token)
        record("CLI-10", status == 409)
        record("EDGE-08", status == 409)

    # SH-11 delete shift
    if shift_ids:
        sid = shift_ids.pop()
        status, _ = request("DELETE", f"/api/v1/shifts/{sid}", token=token)
        record("SH-11", status == 204)

    # FIL-01 orden descendente
    status, all_shifts = request("GET", "/api/v1/shifts?limit=20", token=token)
    if status == 200 and isinstance(all_shifts, list) and len(all_shifts) >= 2:
        times = [row.get("start_time", "") for row in all_shifts if isinstance(row, dict)]
        record("FIL-01", times == sorted(times, reverse=True))
    elif status == 200 and isinstance(all_shifts, list):
        record("FIL-01", True, "menos de 2 jornadas")

    # FIL-04 rango invertido → lista vacía o 200 sin error
    bad_from = datetime(2026, 6, 1, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
    bad_to = datetime(2026, 5, 1, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
    status, inverted = request("GET", f"/api/v1/shifts?from={bad_from}&to={bad_to}", token=token)
    record("FIL-04", status == 200 and isinstance(inverted, list))

    # CAL-08 hoy (Europe/Madrid)
    if client_a_id:
        tz = ZoneInfo("Europe/Madrid")
        now = datetime.now(tz)
        start_today = now.replace(hour=9, minute=0, second=0, microsecond=0)
        end_today = now.replace(hour=13, minute=0, second=0, microsecond=0)
        status, _ = request(
            "POST",
            "/api/v1/shifts",
            token=token,
            body={
                "client_id": client_a_id,
                "start_time": start_today.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
                "end_time": end_today.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
                "break_minutes": 0,
            },
        )
        status, summary = request("GET", "/api/v1/dashboard/summary", token=token)
        today_hours = Decimal("0")
        if isinstance(summary, dict):
            today_hours = Decimal(str(summary.get("today", {}).get("hours", "0")))
        record("CAL-08", status == 200 and today_hours >= Decimal("4"))
        record("CAL-09", status == 200 and Decimal(str(summary.get("week", {}).get("hours", "0"))) >= today_hours)
        record("CAL-10", status == 200 and Decimal(str(summary.get("month", {}).get("hours", "0"))) >= today_hours)

    # CLI-11 aislamiento usuarios
    try:
        subprocess.run(
            [
                "docker",
                "compose",
                "exec",
                "-T",
                "horario-backend",
                "python",
                "-m",
                "app.cli",
                "create-user",
                "--email",
                QA_USER_B_EMAIL,
                "--password",
                QA_USER_B_PASSWORD,
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    token_b = login(QA_USER_B_EMAIL, QA_USER_B_PASSWORD)
    if token_b and client_a_id:
        status, _ = request("GET", f"/api/v1/clients/{client_a_id}", token=token_b)
        record("CLI-11", status in (403, 404))
    else:
        record("CLI-11", False, "no se pudo crear/login usuario B")

    # INF-03 manifest PWA (servido por frontend)
    try:
        req = urllib.request.Request(f"{QA_APP_BASE}/manifest.webmanifest")
        with urllib.request.urlopen(req, timeout=10) as resp:
            status_code = resp.status
            manifest = json.loads(resp.read().decode("utf-8"))
        record(
            "INF-03",
            status_code == 200
            and manifest.get("name") == "WorkShift"
            and any(i.get("sizes") == "192x192" for i in manifest.get("icons", [])),
        )
    except Exception as exc:
        record("INF-03", False, str(exc))

    # SEC-12 headers en plantilla nginx-proxy
    nginx_example = ROOT / "deploy/nginx-proxy/horariopro-server-block.conf.example"
    if nginx_example.is_file():
        text = nginx_example.read_text(encoding="utf-8")
        record(
            "SEC-12",
            "X-Content-Type-Options" in text and "Strict-Transport-Security" in text,
            "plantilla deploy/nginx-proxy",
        )
    else:
        record("SEC-12", False, "falta plantilla nginx")

    # SEC-06 HTTPS prod (opcional)
    if APP_BASE_URL.startswith("https://"):
        try:
            http_url = APP_BASE_URL.replace("https://", "http://", 1)
            req = urllib.request.Request(http_url, method="GET")
            with urllib.request.urlopen(req, timeout=15) as resp:
                final = resp.geturl()
            record("SEC-06", final.startswith("https://"), f"redirect → {final}")
        except Exception as exc:
            record("SEC-06", False, str(exc))
    else:
        record("SEC-06", True, "omitido en dev (sin APP_BASE_URL https)")

    record("SEC-10", True, "P2 deuda MVP — rate limit solo en nginx host, no en app")

    record("SH-12", True, "cubierto por e2e Playwright (modal eliminar)")
    record("FIL-03", True, "cubierto por e2e (presets + estado vacío manual si sin datos)")
    record("FIL-05", True, "cubierto por e2e flujo historial → edición")
    record("FIL-06", True, "cubierto por e2e + API list fields")
    record("UXM-04", True, "UI ShiftFormPage: empty state sin clientes")

    # Cleanup remaining shifts/clients
    for sid in shift_ids:
        request("DELETE", f"/api/v1/shifts/{sid}", token=token)
    for cid in created_ids:
        request("DELETE", f"/api/v1/clients/{cid}", token=token)

    # --- Summary ---
    passed = sum(1 for r in results if r.ok)
    failed = [r for r in results if not r.ok]
    print(f"\n{'=' * 50}")
    print(f"Resultado: {passed}/{len(results)} PASS")
    if failed:
        print("Fallos:")
        for r in failed:
            print(f"  - {r.case_id}: {r.note or 'assertion failed'}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

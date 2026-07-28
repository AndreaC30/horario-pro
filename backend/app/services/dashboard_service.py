from calendar import monthrange
from datetime import datetime, timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.shift import Shift
from app.schemas.dashboard import ClientPeriodSummary, DashboardSummary, PeriodSummary
from app.services.shift_service import _to_shift_read
from app.utils.calculations import estimated_pay, worked_hours

TZ = ZoneInfo("Europe/Madrid")


def _period_bounds(
    now: datetime,
    year: int | None = None,
    month: int | None = None,
) -> tuple[datetime, datetime, datetime, datetime, datetime]:
    """Return start_today, end_today, start_week, start_month, end_month (Europe/Madrid)."""
    local = now.astimezone(TZ)
    start_today = local.replace(hour=0, minute=0, second=0, microsecond=0)
    end_today = start_today + timedelta(days=1)
    start_week = start_today - timedelta(days=start_today.weekday())

    if year is not None and month is not None:
        start_month = local.replace(
            year=year, month=month, day=1, hour=0, minute=0, second=0, microsecond=0,
        )
        _, last_day = monthrange(year, month)
        end_month = start_month.replace(day=last_day) + timedelta(days=1)
    else:
        start_month = local.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # Month-to-date when no explicit month is requested.
        end_month = end_today

    return start_today, end_today, start_week, start_month, end_month


def _shift_in_period(shift: Shift, start: datetime, end: datetime) -> bool:
    st = shift.start_time.astimezone(TZ)
    return start <= st < end


def _aggregate_shifts(shifts: list[Shift]) -> PeriodSummary:
    total_hours = Decimal("0")
    total_money = Decimal("0")
    total_driving = Decimal("0")

    for shift in shifts:
        total_hours += worked_hours(shift.start_time, shift.end_time, shift.break_minutes)
        total_driving += shift.driving_extra
        pay = estimated_pay(
            shift.start_time,
            shift.end_time,
            shift.break_minutes,
            shift.client.hourly_rate,
            shift.driving_extra,
        )
        if pay is not None:
            total_money += pay

    return PeriodSummary(
        hours=total_hours.quantize(Decimal("0.01")),
        estimated_money=total_money.quantize(Decimal("0.01")),
        driving_extras=total_driving.quantize(Decimal("0.01")),
    )


def _aggregate_by_client(shifts: list[Shift]) -> list[ClientPeriodSummary]:
    by_client: dict[int, list[Shift]] = {}
    for shift in shifts:
        by_client.setdefault(shift.client_id, []).append(shift)

    rows: list[ClientPeriodSummary] = []
    for client_shifts in by_client.values():
        client = client_shifts[0].client
        totals = _aggregate_shifts(client_shifts)
        rows.append(
            ClientPeriodSummary(
                client_id=client.id,
                client_name=client.name,
                client_color=client.color,
                hourly_rate=client.hourly_rate,
                hours=totals.hours,
                estimated_money=totals.estimated_money,
                driving_extras=totals.driving_extras,
                shift_count=len(client_shifts),
            ),
        )

    rows.sort(key=lambda row: (row.estimated_money, row.hours), reverse=True)
    return rows


def _load_shifts(db: Session, user_id: int, start: datetime, end: datetime) -> list[Shift]:
    return list(
        db.scalars(
            select(Shift)
            .options(joinedload(Shift.client))
            .where(Shift.user_id == user_id)
            .where(Shift.start_time >= start)
            .where(Shift.start_time < end)
            .order_by(Shift.start_time.desc()),
        )
        .unique()
        .all(),
    )


def get_summary(
    db: Session,
    user_id: int,
    recent_limit: int = 5,
    year: int | None = None,
    month: int | None = None,
) -> DashboardSummary:
    now = datetime.now(TZ)
    start_today, end_today, start_week, start_month, end_month = _period_bounds(
        now, year=year, month=month,
    )

    month_shifts = _load_shifts(db, user_id, start_month, end_month)

    # Hoy / semana siempre son el calendario real (Europe/Madrid), aunque el mes
    # seleccionado sea otro. Reutilizamos month_shifts si la semana cae dentro.
    if start_week >= start_month and end_today <= end_month:
        current_pool = month_shifts
    else:
        current_pool = _load_shifts(db, user_id, start_week, end_today)

    today_shifts = [s for s in current_pool if _shift_in_period(s, start_today, end_today)]
    week_shifts = [s for s in current_pool if _shift_in_period(s, start_week, end_today)]

    if year is not None and month is not None:
        recent_source = month_shifts
    else:
        recent_source = list(
            db.scalars(
                select(Shift)
                .options(joinedload(Shift.client))
                .where(Shift.user_id == user_id)
                .order_by(Shift.start_time.desc()),
            )
            .unique()
            .all(),
        )

    return DashboardSummary(
        today=_aggregate_shifts(today_shifts),
        week=_aggregate_shifts(week_shifts),
        month=_aggregate_shifts(month_shifts),
        by_client_week=_aggregate_by_client(week_shifts),
        by_client_month=_aggregate_by_client(month_shifts),
        recent_shifts=[_to_shift_read(s) for s in recent_source[:recent_limit]],
    )

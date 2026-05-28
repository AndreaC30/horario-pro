from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

MONEY_QUANT = Decimal("0.01")


def worked_minutes(start_time: datetime, end_time: datetime, break_minutes: int) -> int:
    total = int((end_time - start_time).total_seconds() // 60)
    return max(0, total - break_minutes)


def worked_hours(start_time: datetime, end_time: datetime, break_minutes: int) -> Decimal:
    minutes = worked_minutes(start_time, end_time, break_minutes)
    hours = Decimal(minutes) / Decimal(60)
    return hours.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def estimated_pay(
    start_time: datetime,
    end_time: datetime,
    break_minutes: int,
    hourly_rate: Decimal | None,
    driving_extra: Decimal,
) -> Decimal | None:
    if hourly_rate is None:
        if driving_extra > 0:
            return driving_extra.quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)
        return None

    hours = worked_hours(start_time, end_time, break_minutes)
    base = (hours * hourly_rate).quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)
    total = base + driving_extra
    return total.quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)

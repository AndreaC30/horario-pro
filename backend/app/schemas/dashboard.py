from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.shift import ShiftRead


class PeriodSummary(BaseModel):
    hours: Decimal = Field(description="Horas netas trabajadas en el periodo")
    estimated_money: Decimal = Field(description="Importe estimado (0 si no hay tarifas)")
    driving_extras: Decimal = Field(description="Suma de extras de conducción")


class ClientPeriodSummary(BaseModel):
    client_id: int
    client_name: str
    client_color: str
    hourly_rate: Decimal | None = None
    hours: Decimal
    estimated_money: Decimal
    driving_extras: Decimal
    shift_count: int = Field(ge=0)


class DashboardSummary(BaseModel):
    today: PeriodSummary
    week: PeriodSummary
    month: PeriodSummary
    by_client_week: list[ClientPeriodSummary]
    by_client_month: list[ClientPeriodSummary]
    recent_shifts: list[ShiftRead]

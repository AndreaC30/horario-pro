from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.shift import ShiftRead


class PeriodSummary(BaseModel):
    hours: Decimal = Field(description="Horas netas trabajadas en el periodo")
    estimated_money: Decimal = Field(description="Importe estimado (0 si no hay tarifas)")
    driving_extras: Decimal = Field(description="Suma de extras de conducción")


class DashboardSummary(BaseModel):
    today: PeriodSummary
    week: PeriodSummary
    month: PeriodSummary
    recent_shifts: list[ShiftRead]

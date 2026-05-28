from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.client import ClientRead


class ShiftCreate(BaseModel):
    client_id: int
    start_time: datetime
    end_time: datetime
    break_minutes: int = Field(default=0, ge=0)
    driving_extra: Decimal = Field(default=Decimal("0"), ge=0)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_times(self) -> "ShiftCreate":
        if self.end_time <= self.start_time:
            raise ValueError("La hora de fin debe ser posterior a la de inicio")
        duration_minutes = int((self.end_time - self.start_time).total_seconds() // 60)
        if self.break_minutes >= duration_minutes:
            raise ValueError("El descanso debe ser menor que la duración de la jornada")
        return self


class ShiftUpdate(BaseModel):
    client_id: int | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    break_minutes: int | None = Field(default=None, ge=0)
    driving_extra: Decimal | None = Field(default=None, ge=0)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_times(self) -> "ShiftUpdate":
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValueError("La hora de fin debe ser posterior a la de inicio")
        return self


class ShiftRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    start_time: datetime
    end_time: datetime
    break_minutes: int
    driving_extra: Decimal
    notes: str | None
    created_at: datetime
    worked_hours: Decimal
    estimated_pay: Decimal | None
    client: ClientRead

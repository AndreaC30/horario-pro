from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.client import ClientRead


class TimerStartRequest(BaseModel):
    client_id: int
    notes: str | None = None


class TimerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    started_at: datetime
    notes: str | None
    created_at: datetime
    client: ClientRead
    elapsed_seconds: int = Field(ge=0)


class TimerStopResponse(BaseModel):
    """Draft shift payload for the new-shift form after stopping the timer."""

    client_id: int
    start_time: datetime
    end_time: datetime
    break_minutes: int = 0
    driving_extra: float = 0
    notes: str | None = None
    client: ClientRead

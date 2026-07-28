from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

HEX_COLOR_PATTERN = r"^#[0-9A-Fa-f]{6}$"


class ClientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    color: str = Field(default="#2563eb", max_length=32)
    hourly_rate: Decimal | None = Field(default=None, ge=0)

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: str) -> str:
        import re

        if not re.match(HEX_COLOR_PATTERN, value):
            raise ValueError("El color debe ser hexadecimal (#RRGGBB)")
        return value.lower()


class ClientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    color: str | None = Field(default=None, max_length=32)
    hourly_rate: Decimal | None = Field(default=None, ge=0)

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: str | None) -> str | None:
        if value is None:
            return value
        import re

        if not re.match(HEX_COLOR_PATTERN, value):
            raise ValueError("El color debe ser hexadecimal (#RRGGBB)")
        return value.lower()


class ClientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    color: str
    hourly_rate: Decimal | None
    archived_at: datetime | None = None
    created_at: datetime

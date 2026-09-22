import re
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, Field, ConfigDict


# Tipos válidos para transacciones y categorías
VALID_TYPES = {"income", "expense"}
# Patrón de color hexadecimal (#RRGGBB)
HEX_COLOR_PATTERN = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")


# --- Transactions ---

class TransactionBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0, description="Debe ser mayor a 0")
    category: str = Field(..., min_length=1, max_length=100)
    type: str
    date: date

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v not in VALID_TYPES:
            raise ValueError("type debe ser 'income' o 'expense'")
        return v

    @field_validator("description", "category")
    @classmethod
    def strip_and_check(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("No puede estar vacío")
        return v


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = None
    date: Optional[date] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v is not None and v not in VALID_TYPES:
            raise ValueError("type debe ser 'income' o 'expense'")
        return v


class TransactionResponse(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# --- Categories ---

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str
    color: Optional[str] = "#6366f1"

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        if v not in VALID_TYPES:
            raise ValueError("type debe ser 'income' o 'expense'")
        return v

    @field_validator("color")
    @classmethod
    def validate_color(cls, v):
        if v and not HEX_COLOR_PATTERN.match(v):
            raise ValueError("color debe ser un hexadecimal válido (ej: #6366f1)")
        return v


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# --- Dashboard Summary ---

class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    transaction_count: int


# --- Auth / Users ---

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v):
        """Contraseña fuerte: mínimo 8 caracteres, al menos una letra y un número."""
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("La contraseña debe contener al menos una letra")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe contener al menos un número")
        return v

    @field_validator("name")
    @classmethod
    def strip_name(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

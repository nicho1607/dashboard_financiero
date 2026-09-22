from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# --- Transactions ---

class TransactionBase(BaseModel):
    description: str
    amount: float
    category: str
    type: str  # "income" o "expense"
    date: date


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    type: Optional[str] = None
    date: Optional[date] = None


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Categories ---

class CategoryBase(BaseModel):
    name: str
    type: str  # "income" o "expense"
    color: Optional[str] = "#6366f1"


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# --- Dashboard Summary ---

class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    transaction_count: int


# --- Auth / Users ---

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

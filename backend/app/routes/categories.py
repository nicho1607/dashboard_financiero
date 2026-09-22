from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Category, User
from app.auth import get_current_user
from app.schemas import CategoryCreate, CategoryResponse

router = APIRouter()


@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener todas las categorías (requiere autenticación)."""
    return db.query(Category).order_by(Category.name).all()


@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crear una nueva categoría (requiere autenticación)."""
    existing = db.query(Category).filter(Category.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="La categoría ya existe")
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Eliminar una categoría (requiere autenticación)."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(category)
    db.commit()

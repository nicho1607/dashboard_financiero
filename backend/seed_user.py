"""
Script para crear un usuario de prueba.
Ejecutar con: python seed_user.py
"""
from app.database import SessionLocal, init_db
from app.models import User
from app.auth import hash_password

# Datos del usuario de prueba
EMAIL = "nicolacho1607@gmail.com"
NAME = "Nicolas"
PASSWORD = "Nico1607"

init_db()
db = SessionLocal()

existing = db.query(User).filter(User.email == EMAIL).first()
if existing:
    print(f"El usuario {EMAIL} ya existe.")
else:
    user = User(
        name=NAME,
        email=EMAIL,
        hashed_password=hash_password(PASSWORD),
    )
    db.add(user)
    db.commit()
    print("Usuario creado correctamente:")
    print(f"  Email:      {EMAIL}")
    print(f"  Contrasena: {PASSWORD}")

db.close()

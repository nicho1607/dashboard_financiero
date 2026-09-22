"""
Migración: agregar columna user_id a la tabla transactions.
Las transacciones existentes (sin dueño) se ELIMINAN para empezar limpio,
así cada usuario nuevo ve su dashboard en blanco.

Ejecutar con: python migrate_user_transactions.py
"""
from sqlalchemy import text
from app.database import engine

with engine.begin() as conn:
    # 1. Borrar transacciones existentes (eran compartidas / sin dueño)
    conn.execute(text("DELETE FROM transactions"))

    # 2. Agregar la columna user_id si no existe
    conn.execute(text("""
        ALTER TABLE transactions
        ADD COLUMN IF NOT EXISTS user_id INTEGER
    """))

    # 3. Crear la relación de clave foránea (si no existe ya)
    conn.execute(text("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'transactions_user_id_fkey'
            ) THEN
                ALTER TABLE transactions
                ADD CONSTRAINT transactions_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES users(id);
            END IF;
        END $$;
    """))

    # 4. Hacer la columna obligatoria e indexarla
    conn.execute(text("ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_transactions_user_id ON transactions (user_id)"))

print("Migración completada: columna user_id agregada y transacciones antiguas eliminadas.")

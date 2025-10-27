from __future__ import annotations

import os
import sys
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import create_engine, pool
from sqlalchemy.engine import URL

from app.models.base import Base

# make sure Alembic can import app.* modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# load .env file from backend/
load_dotenv()

# --- Build Postgres URL safely from separate env vars ---
pg_url = URL.create(
    "postgresql+psycopg",
    username=os.getenv("PGUSER"),
    password=os.getenv("PGPASSWORD"),
    host=os.getenv("PGHOST"),
    port=int(os.getenv("PGPORT", "5432")),
    database=os.getenv("PGDATABASE"),
    query={"sslmode": os.getenv("PGSSLMODE", "require")},
)

# Interpret config file for logging
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import models + metadata
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # use the assembled URL string
    context.configure(
        url=str(pg_url),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = create_engine(pg_url, poolclass=pool.NullPool, future=True)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

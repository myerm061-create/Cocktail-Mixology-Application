"""
Template for creating new database migration files

When you run: alembic revision --autogenerate -m "add new table"
Alembic uses this template to create a new migration file.

${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
# These are like version numbers for your database changes
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade() -> None:
    """
    Apply this migration: Make changes to the database
    Example: Create tables, add columns, etc.
    """
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    """
    Rollback this migration: Undo the changes
    Example: Drop tables, remove columns, etc.
    """
    ${downgrades if downgrades else "pass"}

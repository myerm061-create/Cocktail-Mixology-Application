"""add_user_ingredients_table

Revision ID: 3c7138bb847a
Revises: 572111b4e4ac
Create Date: 2025-01-27 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3c7138bb847a"
down_revision: Union[str, None] = "572111b4e4ac"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create user_ingredients link table."""
    op.create_table(
        "user_ingredients",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("ingredient_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False, server_default="1.0"),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["ingredient_id"], ["ingredients.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "ingredient_id", name="uq_user_ingredient"),
    )
    op.create_index(
        op.f("ix_user_ingredients_id"), "user_ingredients", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_user_ingredients_user_id"), "user_ingredients", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_user_ingredients_ingredient_id"),
        "user_ingredients",
        ["ingredient_id"],
        unique=False,
    )


def downgrade() -> None:
    """Drop user_ingredients table."""
    op.drop_index(
        op.f("ix_user_ingredients_ingredient_id"), table_name="user_ingredients"
    )
    op.drop_index(
        op.f("ix_user_ingredients_user_id"), table_name="user_ingredients"
    )
    op.drop_index(op.f("ix_user_ingredients_id"), table_name="user_ingredients")
    op.drop_table("user_ingredients")

"""Add categories master table

Revision ID: b7a1c2d3e4f5
Revises: 1f3a2b7c9e4d
Create Date: 2026-02-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7a1c2d3e4f5"
down_revision: Union[str, Sequence[str], None] = "1f3a2b7c9e4d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_categories_id"), "categories", ["id"], unique=False)
    op.create_index(op.f("ix_categories_name"), "categories", ["name"], unique=True)

    op.execute(
        sa.text(
            """
            INSERT INTO categories (name, sort_order, is_active)
            SELECT DISTINCT i.category, 0, TRUE
            FROM items i
            WHERE i.category IS NOT NULL AND TRIM(i.category) <> ''
            ORDER BY i.category
            """
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_categories_name"), table_name="categories")
    op.drop_index(op.f("ix_categories_id"), table_name="categories")
    op.drop_table("categories")

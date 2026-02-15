"""Add quantity and jamboree flag to items

Revision ID: 1f3a2b7c9e4d
Revises: 8b2a6f4c1a9e
Create Date: 2026-02-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1f3a2b7c9e4d"
down_revision: Union[str, Sequence[str], None] = "8b2a6f4c1a9e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "items",
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "items",
        sa.Column(
            "bring_to_jamboree",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("items", "bring_to_jamboree")
    op.drop_column("items", "quantity")

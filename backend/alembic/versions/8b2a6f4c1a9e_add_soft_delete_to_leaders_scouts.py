"""Add soft delete flags for leaders and scouts

Revision ID: 8b2a6f4c1a9e
Revises: cd65016c92fc
Create Date: 2026-02-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8b2a6f4c1a9e"
down_revision: Union[str, Sequence[str], None] = "cd65016c92fc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "leaders",
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "scouts",
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("scouts", "is_deleted")
    op.drop_column("leaders", "is_deleted")

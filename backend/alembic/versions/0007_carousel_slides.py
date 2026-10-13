"""create editable carousel slides table

Revision ID: 0007_carousel_slides
Revises: ab51b67c9eb3
"""
from alembic import op
import sqlalchemy as sa

revision = "0007_carousel_slides"
down_revision = "ab51b67c9eb3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "carousel_slides",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("post_id", sa.Integer(), sa.ForeignKey("posts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("slide_text", sa.String(length=220), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("post_id", "position", name="uq_carousel_slides_post_position"),
    )
    op.create_index("ix_carousel_slides_post_id", "carousel_slides", ["post_id"])


def downgrade() -> None:
    op.drop_index("ix_carousel_slides_post_id", table_name="carousel_slides")
    op.drop_table("carousel_slides")

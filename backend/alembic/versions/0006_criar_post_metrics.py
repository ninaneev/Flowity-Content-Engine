"""cria tabela post_metrics

Revision ID: ab51b67c9eb3
Revises: 89380bd00e80
Create Date: 2026-09-09 17:26:06.428362

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab51b67c9eb3'
down_revision: Union[str, Sequence[str], None] = '89380bd00e80'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'post_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('platform', sa.String(length=20), nullable=False),
        sa.Column('impressions', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('likes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('comments', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('shares', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('clicks', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('collected_at', sa.DateTime(), nullable=False),
        sa.Column('source', sa.String(length=20), nullable=False, server_default='manual'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_post_metrics_id'), 'post_metrics', ['id'], unique=False)
    op.create_index(op.f('ix_post_metrics_post_id'), 'post_metrics', ['post_id'], unique=False)
    op.create_index(op.f('ix_post_metrics_platform'), 'post_metrics', ['platform'], unique=False)
    op.create_index(op.f('ix_post_metrics_collected_at'), 'post_metrics', ['collected_at'], unique=False)


def downgrade() -> None:
    op.drop_table('post_metrics')

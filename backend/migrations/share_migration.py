"""Share functionality migration

This migration adds the necessary tables for the share functionality:
1. shares table - stores share records
2. share_recipients table - stores share recipient information
"""

from extensions import db
from models.share import Share, ShareRecipient

def upgrade():
    # Create shares table
    Share.__table__.create(db.engine)
    
    # Create share_recipients table
    ShareRecipient.__table__.create(db.engine)

def downgrade():
    # Drop tables in reverse order
    ShareRecipient.__table__.drop(db.engine)
    Share.__table__.drop(db.engine) 
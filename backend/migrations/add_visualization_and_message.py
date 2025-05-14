from app import db

def upgrade():
    # Add visualization_type and share_message columns to activity_log table
    db.engine.execute('''
        ALTER TABLE activity_log
        ADD COLUMN visualization_type VARCHAR(50),
        ADD COLUMN share_message TEXT;
    ''')

def downgrade():
    # Remove visualization_type and share_message columns from activity_log table
    db.engine.execute('''
        ALTER TABLE activity_log
        DROP COLUMN visualization_type,
        DROP COLUMN share_message;
    ''') 
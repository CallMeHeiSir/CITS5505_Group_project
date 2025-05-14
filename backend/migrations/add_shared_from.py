from app import db

def upgrade():
    # Add shared_from column to activity_log table
    db.engine.execute('''
        ALTER TABLE activity_log
        ADD COLUMN shared_from INTEGER REFERENCES user(id);
    ''')

def downgrade():
    # Remove shared_from column from activity_log table
    db.engine.execute('''
        ALTER TABLE activity_log
        DROP COLUMN shared_from;
    ''') 
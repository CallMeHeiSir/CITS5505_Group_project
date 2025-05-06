from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection
import sqlite3

class User:
    @staticmethod
    def create(username, email, password, phone, gender, birthdate, address, avatar_path=None):
        password_hash = generate_password_hash(password)
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, phone, gender, birthdate, address, avatar_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (username, email, password_hash, phone, gender, birthdate, address, avatar_path))
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
        finally:
            conn.close()

    @staticmethod
    def find_by_email(email):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        return user

    @staticmethod
    def verify_password(password_hash, password):
        return check_password_hash(password_hash, password)

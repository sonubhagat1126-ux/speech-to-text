import os
import sqlite3
import logging

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'transcripts.db')

def get_db_connection():
    """Establishes a connection to the local SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Returns dictionary-like rows
    return conn

def init_db():
    """Initializes the database schemas (users, transcripts) and handles table upgrades."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # 1. Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        ''')
        
        # 2. Create transcripts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transcripts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                duration INTEGER NOT NULL,
                filename TEXT,
                user_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ''')
        
        # 3. Dynamic schema upgrade: add user_id column if it doesn't exist in older table runs
        cursor.execute("PRAGMA table_info(transcripts)")
        columns = [row['name'] for row in cursor.fetchall()]
        if 'user_id' not in columns:
            logger.info("Upgrading transcripts database table - adding user_id column.")
            cursor.execute('ALTER TABLE transcripts ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE')
            
        conn.commit()
        logger.info("Database schemas successfully initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize database schemas: {e}")
    finally:
        conn.close()

# --- User CRUD operations ---

def create_user(username: str, password_hash: str) -> dict:
    """Creates a new user record in the database."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (username, password_hash)
            VALUES (?, ?)
        ''', (username.strip().lower(), password_hash))
        conn.commit()
        
        user_id = cursor.lastrowid
        return {'id': user_id, 'username': username}
    except sqlite3.IntegrityError:
        logger.warning(f"Registration failed: username '{username}' already exists.")
        return {}
    except Exception as e:
        logger.error(f"Failed to create user record: {e}")
        return {}
    finally:
        conn.close()

def get_user_by_username(username: str) -> dict:
    """Retrieves a user record from the database by username."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username.strip().lower(),))
        row = cursor.fetchone()
        return dict(row) if row else {}
    except Exception as e:
        logger.error(f"Failed to query user: {e}")
        return {}
    finally:
        conn.close()

# --- Transcripts CRUD operations ---

def save_transcript(text: str, duration: int, filename: str, user_id: int) -> dict:
    """Inserts a new transcript record associated with a user into the database."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO transcripts (text, duration, filename, user_id)
            VALUES (?, ?, ?, ?)
        ''', (text, duration, filename, user_id))
        conn.commit()
        
        # Fetch the newly created record
        record_id = cursor.lastrowid
        cursor.execute('SELECT * FROM transcripts WHERE id = ?', (record_id,))
        row = cursor.fetchone()
        
        return dict(row) if row else {}
    except Exception as e:
        logger.error(f"Failed to save transcript: {e}")
        return {}
    finally:
        conn.close()

def get_all_transcripts(user_id: int, search_query: str = None) -> list:
    """Retrieves all transcripts for a specific user, with optional search filtering."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if search_query:
            cursor.execute('''
                SELECT * FROM transcripts 
                WHERE user_id = ? AND text LIKE ? 
                ORDER BY created_at DESC
            ''', (user_id, f"%{search_query}%"))
        else:
            cursor.execute('SELECT * FROM transcripts WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
            
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Failed to retrieve transcripts: {e}")
        return []
    finally:
        conn.close()

def delete_transcript(record_id: int, user_id: int) -> bool:
    """Deletes a transcript record from the database only if it belongs to the specified user."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM transcripts WHERE id = ? AND user_id = ?', (record_id, user_id))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Failed to delete transcript {record_id} for user {user_id}: {e}")
        return False
    finally:
        conn.close()

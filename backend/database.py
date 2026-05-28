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
    """Initializes the database schema if it does not already exist."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transcripts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                duration INTEGER NOT NULL,
                filename TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    finally:
        conn.close()

def save_transcript(text: str, duration: int, filename: str) -> dict:
    """Inserts a new transcript record into the database."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO transcripts (text, duration, filename)
            VALUES (?, ?, ?)
        ''', (text, duration, filename))
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

def get_all_transcripts(search_query: str = None) -> list:
    """Retrieves all transcripts, optionally filtered by a text search query."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if search_query:
            # SQL LIKE clause for safe filtering
            cursor.execute('''
                SELECT * FROM transcripts 
                WHERE text LIKE ? 
                ORDER BY created_at DESC
            ''', (f"%{search_query}%",))
        else:
            cursor.execute('SELECT * FROM transcripts ORDER BY created_at DESC')
            
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Failed to retrieve transcripts: {e}")
        return []
    finally:
        conn.close()

def delete_transcript(record_id: int) -> bool:
    """Deletes a transcript record from the database by its ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM transcripts WHERE id = ?', (record_id,))
        conn.commit()
        # Returns True if a row was affected (deleted)
        return cursor.rowcount > 0
    except Exception as e:
        logger.error(f"Failed to delete transcript {record_id}: {e}")
        return False
    finally:
        conn.close()

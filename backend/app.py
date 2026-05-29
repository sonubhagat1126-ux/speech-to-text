import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pydub import AudioSegment

# Service and database module imports
from stt_service import transcribe_audio
from database import (
    init_db, 
    save_transcript, 
    get_all_transcripts, 
    delete_transcript,
    create_user,
    get_user_by_username
)
from auth import (
    hash_password,
    verify_password,
    generate_auth_token,
    verify_auth_token
)

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure secret key for session token signing
app.secret_key = os.getenv('JWT_SECRET', 'super-secret-key-change-in-production')

# Enable CORS for Next.js frontend running locally
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tmp')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit uploads to 16MB

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize database schema on startup
init_db()

# --- Authentication Helpers ---

def get_current_user_id():
    """
    Parses the Authorization Bearer token from headers and verifies it.
    Returns the user_id if valid, or None if invalid or missing.
    """
    auth_header = request.headers.get('Authorization', None)
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
        
    try:
        token = auth_header.split(' ')[1]
        return verify_auth_token(token, app.secret_key)
    except IndexError:
        return None

# --- Audio Preprocessing ---

def process_audio_file(file_path: str) -> str:
    """
    Converts incoming audio to a standard 16kHz mono WAV format using pydub.
    Falls back to the original file if conversion fails (e.g. if ffmpeg is missing).
    """
    try:
        base_path, _ = os.path.splitext(file_path)
        target_path = f"{base_path}_processed.wav"
        
        logger.info(f"Converting audio file {file_path} to 16kHz mono WAV...")
        sound = AudioSegment.from_file(file_path)
        sound = sound.set_frame_rate(16000).set_channels(1)
        sound.export(target_path, format="wav")
        
        logger.info(f"Successfully processed audio. Target path: {target_path}")
        return target_path
    except Exception as e:
        logger.warning(f"Audio processing failed (pydub/ffmpeg error): {str(e)}. Falling back to raw file.")
        return file_path

# --- System API Endpoints ---

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple API health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'EchoScribe Backend'
    }), 200

# --- User Auth Endpoints ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Registers a new user inside the database."""
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password parameters are required.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    # Check if username is already taken
    existing_user = get_user_by_username(username)
    if existing_user:
        return jsonify({'error': 'Username is already taken.'}), 409

    # Hash password and store user
    password_hash = hash_password(password)
    new_user = create_user(username, password_hash)
    
    if new_user:
        return jsonify({
            'status': 'success',
            'message': 'User registered successfully.',
            'username': new_user['username']
        }), 201
        
    return jsonify({'error': 'Failed to register user.'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Logs in an existing user and returns an authentication token."""
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password parameters are required.'}), 400

    user = get_user_by_username(username)
    if not user or not verify_password(password, user['password_hash']):
        return jsonify({'error': 'Invalid username or password.'}), 401

    # Generate token
    token = generate_auth_token(user['id'], app.secret_key)
    
    return jsonify({
        'status': 'success',
        'token': token,
        'username': user['username']
    }), 200

# --- Audio Transcription Endpoint (Protected optionally) ---

@app.route('/api/transcribe', methods=['POST'])
def upload_audio():
    """Accepts multipart form audio files, processes them, and transcribes them."""
    if 'file' not in request.files:
        return jsonify({'error': 'No audio file found in the request'}), 400

    audio_file = request.files['file']
    if audio_file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    try:
        filename = audio_file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save raw file
        logger.info(f"Saving raw upload to {file_path}")
        audio_file.save(file_path)

        # Preprocess audio (convert format)
        processed_path = process_audio_file(file_path)

        # Transcribe audio
        transcript = transcribe_audio(processed_path)

        # Clean up temporary files
        if processed_path != file_path and os.path.exists(processed_path):
            try:
                os.remove(processed_path)
            except Exception as cleanup_err:
                logger.error(f"Failed to clean up processed file: {cleanup_err}")

        return jsonify({
            'status': 'success',
            'transcript': transcript,
            'filename': filename,
            'path': file_path
        }), 200

    except Exception as e:
        logger.error(f"Error saving/processing uploaded file: {str(e)}")
        return jsonify({'error': f"Failed to save/process file: {str(e)}"}), 500

# --- User Transcripts Endpoints (Strictly Protected) ---

@app.route('/api/transcripts', methods=['GET'])
def list_transcripts():
    """Retrieves all saved transcripts for the currently authenticated user."""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized. Missing or invalid auth session.'}), 401
        
    search_query = request.args.get('q', None)
    records = get_all_transcripts(user_id, search_query)
    return jsonify(records), 200

@app.route('/api/transcripts', methods=['POST'])
def create_transcript_record():
    """Saves a new transcript record to the database under the current user's profile."""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized. Missing or invalid auth session.'}), 401

    data = request.get_json() or {}
    text = data.get('text')
    duration = data.get('duration')
    filename = data.get('filename', '')

    if not text or duration is None:
        return jsonify({'error': 'Missing text or duration parameters.'}), 400

    record = save_transcript(text, int(duration), filename, user_id)
    if record:
        return jsonify(record), 201
    return jsonify({'error': 'Failed to save transcript to database.'}), 500

@app.route('/api/transcripts/<int:record_id>', methods=['DELETE'])
def remove_transcript_record(record_id):
    """Deletes a transcript record from the database by its ID, validating user ownership."""
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized. Missing or invalid auth session.'}), 401

    success = delete_transcript(record_id, user_id)
    if success:
        return jsonify({'message': f'Transcript record {record_id} successfully deleted.'}), 200
    return jsonify({'error': f'Failed to delete record {record_id} or not found/authorized.'}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Run server locally on port 5000
    app.run(host='0.0.0.0', port=port, debug=True)
